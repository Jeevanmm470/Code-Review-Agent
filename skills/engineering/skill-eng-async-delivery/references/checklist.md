# Async Delivery and Background Processing Inspection Checklist

This checklist defines concrete review rules (`ASY01`–`ASY10`), detection patterns, code anti-patterns, remediation guidance, and false-positive safeguards for asynchronous messaging, background workers, and event stream processing across Kafka, SQS, RabbitMQ, Celery, and .NET/Java worker services.

---

## Rule Index

| ID | Rule | Objective |
|---|---|---|
| `ASY01` | Durable Acknowledgement Timing | Acknowledge or commit messages only after all required side effects are durably persisted to prevent data loss. |
| `ASY02` | Consumer Idempotency & Deduplication | Enforce atomic deduplication keys or idempotent mutations to protect against at-least-once duplicate deliveries. |
| `ASY03` | Retry Backoff & Transient Failure Boundaries | Enforce bounded retries with exponential backoff and jitter, preventing immediate loops on permanent errors. |
| `ASY04` | Dead-Letter Isolation & Poison Pill Handling | Route exhausted or permanently unprocessable messages to a Dead-Letter Queue (DLQ) without blocking partitions. |
| `ASY05` | Partition Ordering & Sequential Monotonicity | Enforce partitioning keys and sequence guards when business contracts require strict message ordering. |
| `ASY06` | Consumer Concurrency & Backpressure Limits | Bound concurrent worker tasks and thread pools to prevent memory exhaustion and downstream service saturation. |
| `ASY07` | Worker Graceful Shutdown & Cancellation | Propagate cancellation tokens and await in-flight task completion before process termination. |
| `ASY08` | Transactional Outbox & Publication Durability | Ensure database writes and outgoing message publication commit atomically without split-brain failure windows. |
| `ASY09` | Context & Correlation ID Propagation | Propagate distributed tracing headers and correlation identifiers across asynchronous message boundaries. |
| `ASY10` | Delivery Failure Testing & Recovery | Validate test coverage for transient retry exhaustion, poison pills, concurrent races, and redelivery duplicates. |

---

## Detailed Rule Checklist

### ASY01: Durable Acknowledgement Timing
- **Purpose:** Prevent message loss where consumer acknowledges a message before business mutations are committed.
- **Detect:** Calling `basic_ack`, `delete_message`, or committing Kafka offsets before database transactions commit or downstream persistence finishes.
- **Evidence:** `ack()` called before `db.commit()` or inside an asynchronous fire-and-forget task.
- **Avoid:**
  ```python
  # BAD: Acks message before database transaction commits; crash loses data
  def on_message(ch, method, properties, body):
      ch.basic_ack(delivery_tag=method.delivery_tag)
      db.save_and_commit(json.loads(body))
  ```
- **Remediation:**
  ```python
  # GOOD: Acknowledge message only after database transaction commits
  def on_message(ch, method, properties, body):
      db.save_and_commit(json.loads(body))
      ch.basic_ack(delivery_tag=method.delivery_tag)
  ```
- **Severity:** Critical (Base Deduction: 6.0).

### ASY02: Consumer Idempotency & Deduplication
- **Purpose:** Prevent duplicate execution of side effects under at-least-once delivery semantics.
- **Detect:** Processing financial charges, sending external emails, or mutating non-idempotent counters without checking unique message/event IDs.
- **Evidence:** Executing non-idempotent business logic without unique DB constraints, idempotency keys, or atomic `INSERT ... ON CONFLICT DO NOTHING`.
- **Avoid:**
  ```csharp
  // BAD: Redelivery causes double billing without idempotency check
  public async Task Handle(ChargePaymentMessage message) {
      await _paymentGateway.ChargeAsync(message.CustomerId, message.Amount);
  }
  ```
- **Remediation:**
  ```csharp
  // GOOD: Deduplicate atomically before charging
  public async Task Handle(ChargePaymentMessage message) {
      if (!await _inbox.TryRecordMessageAsync(message.MessageId)) return;
      await _paymentGateway.ChargeAsync(message.CustomerId, message.Amount, message.MessageId);
  }
  ```
- **Severity:** Critical (Base Deduction: 6.0).

### ASY03: Retry Backoff & Transient Failure Boundaries
- **Purpose:** Prevent retry storms and catastrophic cascade failures during downstream service outages.
- **Detect:** Immediate retry loops with zero sleep, retrying permanent input/business errors, or missing exponential backoff with jitter.
- **Evidence:** Catching exceptions and retrying in a tight `while` loop without delay.
- **Avoid:**
  ```python
  # BAD: Tight retry loop on failure amplifies service outage
  for attempt in range(5):
      try:
          return call_downstream()
      except Exception:
          pass
  ```
- **Remediation:**
  ```python
  # GOOD: Exponential backoff with jitter and transient error filtering
  for attempt in range(5):
      try:
          return call_downstream()
      except TransientNetworkError:
          time.sleep((2 ** attempt) + random.uniform(0, 1))
  ```
- **Severity:** High (Base Deduction: 4.0).

### ASY04: Dead-Letter Isolation & Poison Pill Handling
- **Purpose:** Prevent corrupt or unprocessable messages from blocking queue partitions or causing infinite consumer crash loops.
- **Detect:** Uncaught serialization or validation exceptions crashing consumers indefinitely without maximum retry limits or DLQ routing.
- **Evidence:** Consumer failing permanently on a corrupt payload without committing or dead-lettering.
- **Avoid:**
  ```typescript
  // BAD: Malformed JSON throws unhandled exception; queue partition is blocked permanently
  consumer.on('message', async (msg) => {
      const data = JSON.parse(msg.body); // Crash
      await process(data);
  });
  ```
- **Remediation:**
  ```typescript
  // GOOD: Catch corrupt messages, route to DLQ, and acknowledge
  consumer.on('message', async (msg) => {
      try {
          const data = JSON.parse(msg.body);
          await process(data);
      } catch (err) {
          await dlq.publish(msg, err);
          await msg.ack();
      }
  });
  ```
- **Severity:** High (Base Deduction: 4.0).

### ASY05: Partition Ordering & Sequential Monotonicity
- **Purpose:** Ensure sequential processing when business invariants require ordered execution (e.g., account balance updates, state machine transitions).
- **Detect:** Publishing dependent events without partition keys (round-robin dispatch), or processing partition streams in un-synchronized concurrent worker threads.
- **Evidence:** Missing partition key on Kafka/Kinesis record or spawning unbounded threads per partition message.
- **Avoid:**
  ```java
  // BAD: Publishes order events without partition key; updates process out of order
  kafkaTemplate.send("order-events", orderEventPayload);
  ```
- **Remediation:**
  ```java
  // GOOD: Supply aggregate entity ID as partition key to ensure sequential delivery
  kafkaTemplate.send("order-events", orderEventPayload.getOrderId(), orderEventPayload);
  ```
- **Severity:** High (Base Deduction: 4.0).

### ASY06: Consumer Concurrency & Backpressure Limits
- **Purpose:** Prevent OutOfMemory (OOM) crashes and downstream saturation by enforcing bounded consumer concurrency and backpressure.
- **Detect:** Reading unbounded messages into memory queues (e.g., `prefetch_count=0` or unbounded `Channel`/`ExecutorService`).
- **Evidence:** Pulling all available queue messages into memory without concurrency limits.
- **Avoid:**
  ```python
  # BAD: Unbounded prefetch loads 100,000 messages into memory, crashing container
  channel.basic_qos(prefetch_count=0)
  ```
- **Remediation:**
  ```python
  # GOOD: Bounded prefetch matching worker concurrency capacity
  channel.basic_qos(prefetch_count=20)
  ```
- **Severity:** High (Base Deduction: 4.0).

### ASY07: Worker Graceful Shutdown & Cancellation
- **Purpose:** Prevent dropped tasks and corrupted operational state during pod/process termination or deployment restarts.
- **Detect:** Background workers ignoring `SIGTERM` / `CancellationToken`, or abruptly killing active execution threads without waiting for in-flight tasks to complete.
- **Evidence:** Process shutdown handler exiting immediately with `process.exit(0)` without draining active worker pools.
- **Avoid:**
  ```csharp
  // BAD: Background service terminates without awaiting active tasks or checking token
  protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
      while (!stoppingToken.IsCancellationRequested) {
          _ = ProcessNextTaskAsync(); // Fire and forget unobserved
      }
  }
  ```
- **Remediation:**
  ```csharp
  // GOOD: Await in-flight task and observe cancellation token gracefully
  protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
      while (!stoppingToken.IsCancellationRequested) {
          await ProcessNextTaskAsync(stoppingToken);
      }
  }
  ```
- **Severity:** High (Base Deduction: 4.0).

### ASY08: Transactional Outbox & Publication Durability
- **Purpose:** Prevent split-brain failure windows between database commits and message publication (Dual-Write problem).
- **Detect:** Committing to DB first and then calling message broker publisher outside the transaction (if publisher fails, message is lost; if DB fails after publishing, ghost message is dispatched).
- **Evidence:** DB commit followed by separate uncoordinated message broker publish call for critical business events.
- **Avoid:**
  ```python
  # BAD: Dual write vulnerability; if broker.publish fails, DB change has no event
  db.commit_order(order)
  message_broker.publish("order_created", order.to_dict()) # If this fails, event is lost
  ```
- **Remediation:**
  ```python
  # GOOD: Transactional Outbox pattern stores event in same DB transaction
  with db.transaction():
      db.save_order(order)
      db.save_outbox_message(event="order_created", payload=order.to_dict())
  ```
- **Severity:** High (Base Deduction: 4.0).

### ASY09: Context & Correlation ID Propagation
- **Purpose:** Maintain distributed tracing context and observability across asynchronous message queues.
- **Detect:** Publishing messages without injecting distributed trace headers (`traceparent`, `correlation_id`), or consumers ignoring headers when initializing context.
- **Evidence:** Creating new detached trace context on message consumption without parent linkage.
- **Avoid:**
  ```typescript
  // BAD: Discards distributed tracing context when publishing message
  await queue.send({ body: JSON.stringify(data) });
  ```
- **Remediation:**
  ```typescript
  // GOOD: Inject active trace context into message headers
  await queue.send({
      body: JSON.stringify(data),
      headers: { 'traceparent': tracer.getActiveTraceparent() }
  });
  ```
- **Severity:** Medium (Base Deduction: 2.0).

### ASY10: Delivery Failure Testing & Recovery
- **Purpose:** Ensure asynchronous messaging components are verified against real-world failure scenarios.
- **Detect:** Missing tests for redelivery duplicate handling, poison pill payload routing, transient retry exhaustion, or cancellation timeouts.
- **Evidence:** Test suites that only test happy-path message handling without testing at-least-once duplicates or broker disconnection.
- **Avoid:**
  ```python
  # BAD: Only tests happy-path without asserting idempotency on duplicate messages
  def test_order_consumer():
      consumer.handle(sample_msg)
      assert db.get_order(1) is not None
  ```
- **Remediation:**
  ```python
  # GOOD: Explicitly tests duplicate delivery idempotency and DLQ error recovery
  def test_order_consumer_duplicate_idempotent():
      consumer.handle(sample_msg)
      consumer.handle(sample_msg) # Duplicate redelivery
      assert db.count_charges(1) == 1
  ```
- **Severity:** Medium (Base Deduction: 2.0).

