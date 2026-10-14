# Error Handling Inspection Checklist

This checklist defines concrete review rules (`ERR01`–`ERR10`), detection patterns, code anti-patterns, remediation guidance, and false-positive safeguards for cross-language error and exception handling review.

---

## Rule Index

| ID | Rule | Objective |
|---|---|---|
| `ERR01` | Error and Exception Suppression | Identify silently swallowed errors and failures masked as success without safe recovery. |
| `ERR02` | Overly Broad Exception Handling | Identify generic catch-alls (`catch (Exception)`, `except Exception:`) that mask unrelated bugs. |
| `ERR03` | Destructive Rethrow and Loss of Context | Identify rethrows that discard root causes, stack traces, or change exception types unexpectedly. |
| `ERR04` | Error Classification and Contract Mapping | Ensure internal errors map accurately to domain, HTTP/RPC, or message-processing status contracts. |
| `ERR05` | Sensitive Data Leakage in Error Responses | Prevent exposing internal stack traces, database schemas, or credentials in public error payloads. |
| `ERR06` | Unsafe Fallback and Partial Recovery | Identify fallbacks that return invalid/stale defaults or report partial work as complete success. |
| `ERR07` | Retry Safety and Termination | Prevent unbounded retries, retrying permanent client errors, and non-idempotent retry side effects. |
| `ERR08` | Asynchronous and Concurrent Failure Propagation | Ensure errors in async tasks, promises, threads, and background workers are observed and handled. |
| `ERR09` | Transactional Rollback and State Consistency | Ensure exceptions trigger database transaction rollbacks and complete state cleanup. |
| `ERR10` | Error Boundary Integrity and State Safety | Prevent missing boundary handlers, redundant multi-layer handling, and invalid operational states. |

---

## Detailed Rule Checklist

### ERR01: Error and Exception Suppression
- **Purpose:** Prevent silent failures where unhandled errors are dropped, causing caller state drift, unrecorded errors, or data loss.
- **Detect:** Empty `except:` / `catch {}` blocks, functions catching exceptions and returning `None`/`null`/`true` without recording the failure or notifying the caller.
- **Evidence:** Empty catch block or error-to-success conversion bypassing failure signaling.
- **Avoid:**
  ```python
  # BAD: Swallows critical database failure and signals success
  try:
      db.save_order(order)
  except Exception:
      pass
  return {"status": "SUCCESS"}
  ```
- **Remediation:**
  ```python
  # GOOD: Log and rethrow or return explicit domain failure
  try:
      db.save_order(order)
  except DatabaseConnectionError as exc:
      logger.error("Failed to persist order: %s", exc)
      raise OrderPersistenceError("Order save failed") from exc
  ```
- **Severity:** High / Critical (when financial, security, or state consistency operations are concealed).

### ERR02: Overly Broad Exception Handling
- **Purpose:** Prevent catching generic exceptions (`Exception`, `BaseException`, `Throwable`, `System.Exception`) in fine-grained business logic where unexpected programming bugs (e.g. `AttributeError`, `NullPointerException`) or system signals (cancellation, interrupt) get masked.
- **Detect:** Inner code blocks catching base exception types instead of specific target exceptions.
- **Evidence:** Catching top-level exception classes around specific I/O or calculation logic.
- **Avoid:**
  ```java
  // BAD: Catches all exceptions including NullPointerException, masking defects
  try {
      return parseConfig(rawJson);
  } catch (Throwable t) {
      return DefaultConfig.EMPTY;
  }
  ```
- **Remediation:**
  ```java
  // GOOD: Catch only expected format exceptions
  try {
      return parseConfig(rawJson);
  } catch (JsonParseException e) {
      logger.warn("Malformed JSON config, using fallback", e);
      return DefaultConfig.EMPTY;
  }
  ```
- **Severity:** Medium / High.

### ERR03: Destructive Rethrow and Loss of Context
- **Purpose:** Ensure exception wrapping and rethrowing preserves original stack traces and root causes.
- **Detect:** `raise CustomError(str(e))` without `from e` in Python, `throw new CustomException(e.getMessage())` without passing cause `e` in Java, or `throw e;` resetting stack trace instead of `throw;` in C#.
- **Evidence:** Instantiating new exception without passing the captured exception instance as the cause.
- **Avoid:**
  ```csharp
  // BAD: Resets stack trace in C#
  try { Process(); }
  catch (Exception ex) {
      logger.LogError("Failed");
      throw ex; // Destroys original call stack
  }
  ```
- **Remediation:**
  ```csharp
  // GOOD: Preserves original call stack
  try { Process(); }
  catch (Exception ex) {
      logger.LogError("Failed: {Message}", ex.Message);
      throw; // Preserves stack trace
  }
  ```
- **Severity:** Medium.

### ERR04: Error Classification and Contract Mapping
- **Purpose:** Ensure internal failure modes are mapped to accurate HTTP status codes, gRPC status codes, or message dead-letter statuses.
- **Detect:** Catching client validation errors (`InvalidInputError`) and returning HTTP 500, or converting server outages to HTTP 400 or HTTP 200 OK with embedded error strings.
- **Evidence:** Mismatched status code returned relative to the nature of the encountered exception.
- **Avoid:**
  ```typescript
  // BAD: Validation failure mapped to generic 500 Internal Server Error
  catch (err) {
      if (err instanceof ValidationError) {
          return res.status(500).json({ error: "Server error" });
      }
  }
  ```
- **Remediation:**
  ```typescript
  // GOOD: Accurate HTTP contract mapping
  catch (err) {
      if (err instanceof ValidationError) {
          return res.status(400).json({ error: err.message, field: err.field });
      }
      return res.status(500).json({ error: "Internal server error" });
  }
  ```
- **Severity:** Medium / High.

### ERR05: Sensitive Data Leakage in Error Responses
- **Purpose:** Prevent internal implementation details, raw SQL syntax, file paths, credentials, or stack traces from leaking to external untrusted clients in error payloads.
- **Detect:** Serializing raw `exc.__dict__`, `e.printStackTrace()`, or SQL error strings directly into API responses.
- **Evidence:** Direct return of raw system exception messages to API callers.
- **Avoid:**
  ```python
  # BAD: Leaks raw SQL query and database connection details to API client
  except DatabaseError as e:
      return {"error": str(e), "trace": traceback.format_exc()}, 500
  ```
- **Remediation:**
  ```python
  # GOOD: Log details internally with correlation ID; return sanitized error
  except DatabaseError as e:
      logger.error("DB failure [ref=%s]: %s", correlation_id, e, exc_info=True)
      return {"error": "An internal error occurred", "reference": correlation_id}, 500
  ```
- **Severity:** High / Critical (when credentials or PII leak).

### ERR06: Unsafe Fallback and Partial Recovery
- **Purpose:** Ensure fallback values or recovery paths do not return stale/invalid data that compromises downstream correctness or presents partial execution as total success.
- **Detect:** Multi-step pipelines where Step 1 fails, but Step 2 and Step 3 continue with corrupt defaults without checking Step 1's outcome.
- **Evidence:** Unvalidated fallback execution continuing multi-stage transactions.
- **Avoid:**
  ```python
  # BAD: Fallback returns empty list for user permissions, bypassing access checks
  try:
      permissions = auth_service.get_permissions(user_id)
  except ServiceUnavailable:
      permissions = [] # Downstream treats empty list as unrestricted admin in broken logic
  ```
- **Remediation:**
  ```python
  # GOOD: Fail closed when required security or core data cannot be obtained
  try:
      permissions = auth_service.get_permissions(user_id)
  except ServiceUnavailable as exc:
      raise AuthorizationUnavailableError("Unable to verify user permissions") from exc
  ```
- **Severity:** High / Critical.

### ERR07: Retry Safety and Termination
- **Purpose:** Ensure retries have bounded maximum attempts, use exponential backoff, do not retry permanent non-recoverable errors (e.g. 400 Bad Request, 401 Unauthorized), and safeguard non-idempotent operations.
- **Detect:** `while True:` retry loops without breaks, retrying on HTTP 400/404, or retrying credit card charge API calls without idempotency keys.
- **Evidence:** Unbounded retry loop or retry logic targeting permanent client error classes.
- **Avoid:**
  ```python
  # BAD: Infinite retry loop on validation failure
  while True:
      try:
          client.post_payment(charge_data)
          break
      except InvalidCardNumberError:
          time.sleep(1) # Permanent error will never succeed
  ```
- **Remediation:**
  ```python
  # GOOD: Bounded retries targeting transient network faults with idempotency key
  for attempt in range(MAX_RETRIES):
      try:
          client.post_payment(charge_data, idempotency_key=key)
          break
      except TransientNetworkError:
          if attempt == MAX_RETRIES - 1:
              raise
          time.sleep(2 ** attempt)
  ```
- **Severity:** High.

### ERR08: Asynchronous and Background Error Propagation
- **Purpose:** Ensure unhandled rejections, background task exceptions, and thread errors are observed, handled, or reported to error monitoring rather than silently terminating.
- **Detect:** Unawaited async calls without `.catch()`, unhandled exceptions inside `threading.Thread(target=...)` or `Task.Run(...)` that terminate worker threads without notification.
- **Evidence:** Floating async promise or background task execution lacking error handling or rejection monitoring.
- **Avoid:**
  ```typescript
  // BAD: Floating promise unhandled rejection terminates Node.js process or hangs
  function handleWebhook(payload: WebhookPayload) {
      processWebhookAsync(payload); // Unhandled floating Promise
  }
  ```
- **Remediation:**
  ```typescript
  // GOOD: Explicit error handling on background execution
  function handleWebhook(payload: WebhookPayload) {
      processWebhookAsync(payload).catch((err) => {
          logger.error("Failed to process background webhook", { error: err });
      });
  }
  ```
- **Severity:** High.

### ERR09: Transactional Rollback and State Consistency
- **Purpose:** Ensure database or multi-resource operations roll back transaction state upon failure instead of committing partial mutations.
- **Detect:** Catching an exception inside a transactional method and swallowing it without rolling back or marking transaction rollback-only.
- **Evidence:** Catch block around database writes returning normally while keeping transaction open for commit.
- **Avoid:**
  ```python
  # BAD: Catches failure during transfer, but transaction still commits partial debit
  with db.transaction():
      db.debit_account(source, amount)
      try:
          db.credit_account(target, amount)
      except Exception:
          logger.error("Credit failed") # Source debit is still committed!
  ```
- **Remediation:**
  ```python
  # GOOD: Ensure entire transaction aborts on any failure
  with db.transaction():
      db.debit_account(source, amount)
      db.credit_account(target, amount)
  ```
- **Severity:** Critical (data inconsistency / financial loss).

### ERR10: Error Boundary Integrity and State Safety
- **Purpose:** Ensure external integration boundaries, event consumers, and worker loops have top-level error boundaries that record failures and prevent unmanaged process death, while avoiding redundant logging cascades.
- **Detect:** Message consumer loop dying completely on a single malformed message, or catching, logging, and rethrowing at every intermediate layer.
- **Evidence:** Worker loop missing top-level catch boundary or multi-layer log-and-rethrow pattern.
- **Avoid:**
  ```python
  # BAD: Single bad message crashes entire queue worker loop
  def run_worker(queue):
      while True:
          msg = queue.get()
          process_message(msg) # Uncaught exception crashes worker
  ```
- **Remediation:**
  ```python
  # GOOD: Top-level error boundary logs, sends to dead-letter queue, and continues worker
  def run_worker(queue):
      while True:
          msg = queue.get()
          try:
              process_message(msg)
          except Exception as exc:
              logger.error("Failed to process message %s: %s", msg.id, exc)
              queue.send_to_dlq(msg)
  ```
- **Severity:** High.

---

## Disambiguation and Skill Boundaries

- **ERR01 vs. ERR06**: `ERR01` applies when an error is silently dropped or masked with an unwarranted success status. `ERR06` applies when a fallback mechanism produces invalid, incomplete, or corrupted data that breaks business invariants.
- **ERR02 vs. ERR10**: `ERR02` applies to overly broad catches in inner business logic masking bugs. `ERR10` applies to missing top-level error boundaries at worker/process entry points.
- **ERR04 vs. API Design**: `ERR04` governs runtime classification of error statuses. General API route schemas belong to API Design skills.
- **ERR05 vs. Security**: `ERR05` governs exception handling that returns sensitive traces. OWASP injection flaws belong to [`skill-eng-security`](../skill-eng-security/SKILL.md).

