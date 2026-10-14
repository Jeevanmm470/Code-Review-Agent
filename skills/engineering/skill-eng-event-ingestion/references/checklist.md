# Event Ingestion and Webhook Safety Inspection Checklist

This checklist defines concrete review rules (`EVT01`–`EVT10`), detection patterns, code anti-patterns, remediation guidance, and false-positive safeguards for cross-language event ingestion and webhook endpoint review.

---

## Rule Index

| ID | Rule | Objective |
|---|---|---|
| `EVT01` | Webhook Signature Verification | Verify webhook signatures using timing-safe comparisons against raw unparsed request bytes before processing. |
| `EVT02` | Secret Protection and Safe Transport | Never accept webhook signing secrets via query parameters, and never log raw secrets or Authorization headers. |
| `EVT03` | Payload and Header Schema Validation | Enforce strict size limits, expected Content-Type, and structural schema validation on all inbound event payloads. |
| `EVT04` | Event Idempotency and Deduplication | Enforce atomic deduplication using provider event IDs or unique message keys before executing side effects. |
| `EVT05` | Timely Acknowledgment and Async Queueing | Acknowledge webhooks quickly after durable queuing; avoid synchronous long-running tasks in receiver path. |
| `EVT06` | Timestamp Validation and Replay Defense | Validate timestamp headers against a tight clock drift tolerance (e.g., ±5 min) to prevent replay attacks. |
| `EVT07` | Delivery Ordering and Monotonic Sequencing | Check event sequencing or version timestamps before applying state mutations to prevent out-of-order overwrites. |
| `EVT08` | Tenant Scoping and Resource Authorization | Scope event processing explicitly to verified tenant boundaries; do not trust arbitrary resource IDs in payload. |
| `EVT09` | URL Callback and SSRF Defense | Sanitize, restrict schemes, and validate IP addresses for any callback URLs or resource fetch endpoints in payloads. |
| `EVT10` | Error Boundaries and Dead-Letter Isolation | Route unprocessable or poison payloads to a Dead-Letter Queue (DLQ) without crashing consumers or blocking streams. |

---

## Detailed Rule Checklist

### EVT01: Webhook Signature Verification
- **Purpose:** Ensure authenticity and integrity of incoming webhook requests from external providers.
- **Detect:** Parsing JSON before HMAC calculation, missing signature headers, or using variable-time `==` comparison instead of timing-safe comparisons.
- **Evidence:** Re-serializing parsed JSON to bytes or comparing signatures with `==` / `===`.
- **Avoid:**
  ```python
  # BAD: Deserializing JSON first breaks byte accuracy; variable-time equality allows timing attacks
  payload = request.get_json()
  expected = hmac.new(SECRET, json.dumps(payload).encode(), hashlib.sha256).hexdigest()
  if request.headers.get("X-Signature") != expected:
      return "Invalid", 400
  ```
- **Remediation:**
  ```python
  # GOOD: Constant-time comparison against raw request bytes
  raw_body = request.get_data()
  expected = hmac.new(SECRET, raw_body, hashlib.sha256).hexdigest()
  if not hmac.compare_digest(request.headers.get("X-Signature", ""), expected):
      return "Invalid", 401
  ```
- **Severity:** Critical (Base Deduction: 6.0).

### EVT02: Secret Protection and Safe Transport
- **Purpose:** Prevent leakage of webhook signing secrets and authentication tokens.
- **Detect:** Accepting secrets via URL query parameters, hardcoding secrets in source code, or logging raw authorization headers.
- **Evidence:** Query parameter secret inspection or `console.log(req.headers)`.
- **Avoid:**
  ```javascript
  // BAD: Secret passed in URL query param and logged in server logs
  app.post('/webhook', (req, res) => {
      console.log('Secret:', req.query.secret);
      if (req.query.secret !== process.env.SECRET) return res.sendStatus(401);
  });
  ```
- **Remediation:**
  ```javascript
  // GOOD: Secrets received via headers and redacted from logs
  app.post('/webhook', (req, res) => {
      const authHeader = req.headers['authorization'];
      if (!timingSafeMatch(authHeader, process.env.SECRET)) return res.sendStatus(401);
  });
  ```
- **Severity:** Critical (Base Deduction: 6.0).

### EVT03: Payload and Header Schema Validation
- **Purpose:** Protect endpoints from memory exhaustion, unexpected content-types, and malformed structures.
- **Detect:** Reading unbounded byte arrays without size limits, missing `Content-Type: application/json` enforcement, or skipping schema validation.
- **Evidence:** Unbounded `@RequestBody byte[]` parsing or missing data validation models.
- **Avoid:**
  ```java
  // BAD: Unbounded body buffering with no content type or schema validation
  @PostMapping("/events")
  public void ingest(@RequestBody byte[] rawPayload) {
      process(rawPayload);
  }
  ```
- **Remediation:**
  ```java
  // GOOD: Enforce content type, payload limit, and strict schema validation
  @PostMapping(value = "/events", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Void> ingest(@Valid @RequestBody EventPayload payload) {
      eventQueue.enqueue(payload);
      return ResponseEntity.accepted().build();
  }
  ```
- **Severity:** High (Base Deduction: 4.0).

### EVT04: Event Idempotency and Deduplication
- **Purpose:** Ensure exactly-once business processing semantics despite at-least-once network delivery.
- **Detect:** Executing financial or state-mutating actions without checking or persisting unique event IDs.
- **Evidence:** Directly calling side effects without deduplication keys or unique constraint guards.
- **Avoid:**
  ```python
  # BAD: Re-processing event captures funds multiple times
  @app.post("/events/payment")
  async def handle_payment(event: dict):
      db.capture_funds(event["order_id"], event["amount"])
  ```
- **Remediation:**
  ```python
  # GOOD: Atomic deduplication via unique key insert or Redis lock
  @app.post("/events/payment")
  async def handle_payment(event: dict):
      if not await db.insert_event_idempotency_key(event["id"]):
          return {"status": "duplicate_ignored"}
      db.capture_funds(event["order_id"], event["amount"])
  ```
- **Severity:** Critical (Base Deduction: 6.0).

### EVT05: Timely Acknowledgment and Async Queueing
- **Purpose:** Prevent webhook timeouts and downstream provider retry storms.
- **Detect:** Synchronously executing slow database migrations, external HTTP calls, or report generation inside webhook handlers.
- **Evidence:** Awaiting long-running promises before returning HTTP response.
- **Avoid:**
  ```typescript
  // BAD: Heavy synchronous work causes webhook provider timeout
  app.post('/webhook', async (req, res) => {
      await generateHugeReport(req.body.id);
      await syncAllCustomerData(req.body.customerId);
      res.json({ status: 'done' });
  });
  ```
- **Remediation:**
  ```typescript
  // GOOD: Enqueue message durably and return HTTP 202 immediately
  app.post('/webhook', async (req, res) => {
      await messageQueue.enqueue(req.body);
      res.status(202).json({ status: 'queued' });
  });
  ```
- **Severity:** High (Base Deduction: 4.0).

### EVT06: Timestamp Validation and Replay Defense
- **Purpose:** Prevent replay attacks using previously recorded valid webhook packets.
- **Detect:** Signature check present but lacking timestamp drift validation against current system time.
- **Evidence:** Missing timestamp header extraction or unbounded age acceptance.
- **Avoid:**
  ```python
  # BAD: Signature valid forever; enables unlimited replay attacks
  def verify(signature, body):
      return hmac.compare_digest(signature, compute_hash(body))
  ```
- **Remediation:**
  ```python
  # GOOD: Enforce ±300s clock drift tolerance on signed timestamp
  def verify(signature, timestamp, body):
      if abs(time.time() - int(timestamp)) > 300:
          raise ReplayError("Timestamp outside tolerance")
      signed_payload = f"{timestamp}.".encode() + body
      return hmac.compare_digest(signature, compute_hash(signed_payload))
  ```
- **Severity:** High (Base Deduction: 4.0).

### EVT07: Delivery Ordering and Monotonic Sequencing
- **Purpose:** Prevent out-of-order event delivery from overwriting newer entity state.
- **Detect:** Overwriting database status directly without verifying event version number or timestamp against existing entity state.
- **Evidence:** Direct assignment of event properties without sequence guards.
- **Avoid:**
  ```csharp
  // BAD: Out-of-order event overwrites newer status with stale state
  public async Task Handle(OrderUpdatedEvent evt) {
      var order = await _repo.GetAsync(evt.OrderId);
      order.Status = evt.NewStatus;
      await _repo.SaveAsync(order);
  }
  ```
- **Remediation:**
  ```csharp
  // GOOD: Monotonic sequence or timestamp check before applying updates
  public async Task Handle(OrderUpdatedEvent evt) {
      var order = await _repo.GetAsync(evt.OrderId);
      if (evt.Version <= order.Version) return; // Ignore stale event
      order.Status = evt.NewStatus;
      order.Version = evt.Version;
      await _repo.SaveAsync(order);
  }
  ```
- **Severity:** High (Base Deduction: 4.0).

### EVT08: Tenant Scoping and Resource Authorization
- **Purpose:** Prevent cross-tenant data corruption or privilege escalation via unverified payload parameters.
- **Detect:** Performing mutations on resources based on IDs in event body without verifying tenant ownership against authenticated endpoint credentials.
- **Evidence:** Modifying resources across accounts without tenancy validation.
- **Avoid:**
  ```java
  // BAD: Trusts tenantId and resourceId directly from untrusted payload body
  @PostMapping("/webhooks")
  public void onWebhook(@RequestBody EventDto dto) {
      accountService.updatePlan(dto.getTenantId(), dto.getPlanId());
  }
  ```
- **Remediation:**
  ```java
  // GOOD: Verifies resource ownership matches authenticated webhook endpoint tenant
  @PostMapping("/webhooks/{tenantId}")
  public void onWebhook(@PathVariable String tenantId, @RequestBody EventDto dto) {
      verifyEndpointSignature(tenantId, request);
      accountService.updatePlanForTenant(tenantId, dto.getPlanId());
  }
  ```
- **Severity:** Critical (Base Deduction: 6.0).

### EVT09: URL Callback and SSRF Defense
- **Purpose:** Prevent Server-Side Request Forgery when event payloads specify download or callback URLs.
- **Detect:** Issuing HTTP requests to URLs provided in payloads without validating scheme, host, and destination IP against private CIDRs.
- **Evidence:** Calling `http.get(payload.url)` directly.
- **Avoid:**
  ```python
  # BAD: Fetches arbitrary payload URL allowing internal network scanning / SSRF
  def process_event(event):
      res = requests.get(event["download_url"])
      save_file(res.content)
  ```
- **Remediation:**
  ```python
  # GOOD: Validate URL scheme, hostname allowlist, and resolve DNS to block private IPs
  def process_event(event):
      url = validate_safe_external_url(event["download_url"], allowed_domains=["cdn.trusted.com"])
      res = safe_http_client.get(url)
      save_file(res.content)
  ```
- **Severity:** Critical (Base Deduction: 6.0).

### EVT10: Error Boundaries and Dead-Letter Isolation
- **Purpose:** Prevent poison pill payloads from crashing message consumers or blocking entire partition queues.
- **Detect:** Consumers crashing on malformed payloads without try/catch boundaries, retry exhaustion limits, or DLQ routing.
- **Evidence:** Uncaught deserialization errors triggering infinite redelivery loops.
- **Avoid:**
  ```typescript
  // BAD: JSON parse failure throws uncaught error, blocking queue partition permanently
  consumer.on('message', async (msg) => {
      const data = JSON.parse(msg.body);
      await handle(data);
  });
  ```
- **Remediation:**
  ```typescript
  // GOOD: Catch errors, route poison pills to DLQ after max retries, and ack original
  consumer.on('message', async (msg) => {
      try {
          const data = JSON.parse(msg.body);
          await handle(data);
      } catch (err) {
          logger.error('Failed processing message', { err, msgId: msg.id });
          await dlqProducer.send({ msg, error: err.message });
          await msg.ack();
      }
  });
  ```
- **Severity:** High (Base Deduction: 4.0).

