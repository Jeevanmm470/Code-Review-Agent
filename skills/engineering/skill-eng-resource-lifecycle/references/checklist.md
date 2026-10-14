# Resource Lifecycle Inspection Checklist & Rules Reference

Detailed rule definitions, detection patterns, evidence requirements, and remediation directions for `skill-eng-resource-lifecycle`.

---

## RES01: Deterministic Ownership & Disposal

- **Purpose:** Ensure every acquired native or pooled resource (file descriptors, sockets, streams, database handles) has an unambiguous owner responsible for guaranteed, deterministic release.
- **Detect:**
  - Files, HTTP responses, database connections, or socket streams opened via raw initialization without automatic resource management constructs.
  - Ambiguous ownership where caller and callee each assume the other will close the handle.
  - Handlers created inside functions and neither returned nor disposed.
- **Evidence:** Concrete acquisition statement without enclosing scope guards (`with`, `try-with-resources`, `using`, `defer`).
- **Avoid:** Flagging factory methods designed to return newly instantiated streams/connections to the caller, or dependencies managed by DI containers.
- **Remediation:** Enclose the acquired resource in language-idiomatic scope management or explicitly document and transfer ownership to the caller.
- **Severity:** HIGH (CRITICAL if inside tight loops or high-frequency request paths).

---

## RES02: Exception-Safe Cleanup & Scope Guards

- **Purpose:** Guarantee resource release across all early returns, unhandled exceptions, and partial operation failures.
- **Detect:**
  - Resources closed manually via `.close()` or `.dispose()` placed after business logic statements that can raise exceptions.
  - Early `return` or `break` statements bypassing subsequent manual cleanup calls.
  - Cleanup statements placed in non-guaranteed paths rather than `finally` blocks or automatic scope guards.
- **Evidence:** Code path where an exception thrown by an intermediate line bypasses the closing invocation.
- **Avoid:** Flagging code where enclosing frameworks (e.g., Spring transaction manager, Flask teardown context) guarantee resource release on exception.
- **Remediation:** Move cleanup to a `finally` block or adopt language constructs (`using`, `try-with-resources`, `with`, `defer`).
- **Severity:** HIGH.

---

## RES03: Partial Initialization & Rollback

- **Purpose:** Ensure multi-resource initialization safely tears down already-acquired resources if subsequent initialization steps fail.
- **Detect:**
  - Sequential acquisition of multiple resources (e.g., file handle + socket + DB transaction) where failure in allocating resource #2 leaves resource #1 orphaned and open.
  - Multi-step constructor initializing multiple native handles without exception-safe rollback on constructor failure.
- **Evidence:** Multiple allocations in sequence where the failure of a later step aborts execution without cleaning up earlier steps.
- **Avoid:** Systems where all resources are managed by independent RAII wrappers or individual nested context managers.
- **Remediation:** Nest context managers, chain `try-with-resources`, or execute clean-up in an exception handler on partial construction failure.
- **Severity:** HIGH.

---

## RES04: Async Scope & In-Flight Concurrency

- **Purpose:** Prevent disposing or recycling resources while asynchronous operations or background promises are actively executing against them.
- **Detect:**
  - Request-scoped database contexts, streams, or HTTP clients disposed immediately after launching an unawaited fire-and-forget background task.
  - C# `using` or Python `async with` block exiting while tasks holding the resource are still in-flight.
  - Use-after-disposal exceptions caused by race conditions between disposal and async task execution.
- **Evidence:** Asynchronous task spawned with access to a scoped resource whose lifecycle terminates before task completion.
- **Avoid:** Background tasks that explicitly clone independent connection instances or transfer ownership cleanly.
- **Remediation:** Await background work within the resource scope or pass a detached, independently-owned resource copy to the async worker.
- **Severity:** HIGH (CRITICAL if causing silent data corruption).

---

## RES05: Synchronization Primitive Release

- **Purpose:** Ensure locks, mutexes, semaphores, and monitor locks are reliably released across all code paths to prevent thread deadlocks and system lockups.
- **Detect:**
  - Manual lock acquisition (`lock.acquire()`, `Monitor.Enter`) where `lock.release()` / `Monitor.Exit` is not guarded by a `finally` block or RAII lock guard.
  - Early returns or exceptions between lock acquisition and release.
  - Asymmetric semaphore acquisition without guaranteed release on error.
- **Evidence:** Execution branch starting after lock acquisition that exits without invoking release.
- **Avoid:** Language built-in lock blocks (e.g., C# `lock (obj)`, Java `synchronized (obj)`, Python `with lock:`) which handle release automatically.
- **Remediation:** Wrap lock operations in language-idiomatic context managers (`with lock:`, `lock (...)`, `defer mutex.Unlock()`) or `try...finally`.
- **Severity:** CRITICAL.

---

## RES06: Connection Pool & Client Reuse

- **Purpose:** Prevent creating disposable heavyweight clients (HTTP clients, DB connection pools) in high-frequency loops and ensure borrowed connections return to the pool promptly.
- **Detect:**
  - Instantiating a new `HttpClient`, `MongoClient`, or database connection pool per HTTP request or in tight processing loops.
  - Borrowing a connection from a pool without returning it (missing connection close/release back to the pool).
  - Unbounded pool acquisition causing socket starvation or port exhaustion.
- **Evidence:** Constructor call for heavyweight client or pool inside a request handler or loop body.
- **Avoid:** Lightweight domain objects or client wrappers that wrap a static, shared underlying connection pool.
- **Remediation:** Instantiate heavyweight clients as application singletons or pooled services and borrow/return scoped connections.
- **Severity:** MEDIUM (HIGH if leading to socket exhaustion under load).

---

## RES07: Subprocess & Worker Termination

- **Purpose:** Guarantee child processes, worker threads, and process pipes are drained, joined, or terminated on parent shutdown or cancellation.
- **Detect:**
  - Spawning `subprocess.Popen` / `ProcessBuilder` without waiting (`wait()`), terminating on error, or closing standard I/O pipes.
  - Zombie processes left running indefinitely when parent process encounters an error.
  - Process stdout/stderr pipe buffer filling up and deadlocking the subprocess because streams are not drained.
- **Evidence:** Process spawned without timeout, without stdout draining, or without termination guards in `finally` blocks.
- **Avoid:** Long-lived detached background daemon processes intentionally designed to outlive the launcher.
- **Remediation:** Manage child processes using context managers, communicate with timeouts, and terminate/kill in `finally` handlers.
- **Severity:** HIGH.

---

## RES08: Temporary File & Artifact Pruning

- **Purpose:** Ensure temporary files, directories, and scratch buffers are deleted on process completion, early exit, or failure.
- **Detect:**
  - Creating temporary files (`tempfile.mktemp`, `File.createTempFile`) without explicit deletion or automatic `deleteOnExit` / `TemporaryDirectory` cleanup.
  - Temp files created during batch processing or uploads remaining on disk after processing throws an error.
  - Unbounded accumulation of temporary artifacts filling up disk storage.
- **Evidence:** Temp file creation without cleanup in `finally` or context manager.
- **Avoid:** Files intended for persistent caching or handed off to downstream background ingestors.
- **Remediation:** Use automatic temp directory context managers (`tempfile.TemporaryDirectory()`, `using TempDirectory`) or register `deleteOnExit` guards.
- **Severity:** MEDIUM.

---

## RES09: Subscription, Timer & Listener Unregistration

- **Purpose:** Unsubscribe event handlers, dispose active timers, and cancel callbacks when parent components or sessions are destroyed.
- **Detect:**
  - Registering listeners/observers on long-lived singletons or event buses from short-lived objects without unregistering on teardown.
  - Starting recurring timers (`setInterval`, `System.Threading.Timer`) without stopping/disposing them when the parent scope closes.
  - Unmanaged event subscriptions preventing garbage collection (memory leak / liveness leak).
- **Evidence:** Event subscription in component initialization with no corresponding unsubscription in `dispose` / `destroy` / `unmount`.
- **Avoid:** Subscriptions between objects sharing identical lifecycles (e.g., both are singletons) or weak-reference event brokers.
- **Remediation:** Implement `IDisposable` / `OnDestroy` to remove listeners, clear intervals, and dispose timer handles.
- **Severity:** MEDIUM (HIGH if causing repeated execution / duplicate side effects).

---

## RES10: Resource Lifecycle Test Verification

- **Purpose:** Verify test suites validate cleanup on exception paths, cancellation, and repeated execution without leaking state or dangling handles.
- **Detect:**
  - Tests creating files, sockets, or mock servers without tearDown / cleanup fixtures.
  - Missing tests verifying that connections or resources are returned on transient failures.
  - Flaky tests caused by leftover state, port conflicts, or unclosed file locks from previous test runs.
- **Evidence:** Test creating external resources without `@AfterEach` / `tearDown` cleanup or tests asserting only happy-path resource lifecycles.
- **Avoid:** Pure unit tests executing completely in-memory with mocked resource layers.
- **Remediation:** Add automated cleanup hooks in test fixtures and assert resource disposal under error conditions.
- **Severity:** LOW.

