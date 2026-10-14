---
name: skill-eng-async-delivery
description: >-
  Activate when reviewing code changes for asynchronous message delivery, message queue
  consumers, background worker lifecycles, acknowledgement timing, at-least-once delivery,
  duplicate processing idempotency, consumer concurrency, dead-letter routing, and outbox
  durability across Kafka, SQS, RabbitMQ, Celery, and BackgroundService pipelines.
---

# Engineering Async Delivery Review Skill

## 1. Purpose & Activation

This skill evaluates pull requests and code modifications for defects in asynchronous message delivery, queue consumers, event stream processing, background worker lifecycles, acknowledgement timing, and transactional durability across distributed messaging frameworks (e.g., Kafka, SQS, RabbitMQ, Celery, .NET BackgroundService, Java Spring JMS).

**Activate when** code changes modify message queue consumers, background task workers, message acknowledgement (`ack`/`nack`/`commit`), retry backoffs, dead-letter queues (DLQ), consumer concurrency limits, partition ordering, transactional outbox/inbox logic, or worker shutdown handlers; or when review context cites message loss, duplicate processing bugs, poison pill loops, queue lag, or worker starvation.

Do not report findings merely because simple non-critical tasks omit transactional outboxes, use lightweight memory queues, or rely on framework-managed default acknowledgement lifecycles.

## 2. Technology Context

Infer the target messaging technology and framework from repository dependencies and imports (e.g., Kafka/Confluent, AWS SQS, RabbitMQ/pika/amqplib, Celery, MassTransit, Spring JMS, BullMQ). Apply delivery principles cross-language (Python, Java, C#, Go, TypeScript), evaluating implementation correctness against the declared or implicit delivery contract (at-least-once vs at-most-once).

Refer to [`references/checklist.md`](references/checklist.md) for technology-specific detection patterns and examples.

Technology context guides how rules are applied; it is not a standalone review objective. Report only evidence-based asynchronous delivery defects, not findings based solely on message broker preferences.

## 3. Async Delivery Rules

| ID | Rule | Objective |
|---|---|---|
| ASY01 | Durable Acknowledgement Timing | Acknowledge or commit messages only after all required side effects are durably persisted to prevent data loss. |
| ASY02 | Consumer Idempotency & Deduplication | Enforce atomic deduplication keys or idempotent mutations to protect against at-least-once duplicate deliveries. |
| ASY03 | Retry Backoff & Transient Failure Boundaries | Enforce bounded retries with exponential backoff and jitter, preventing immediate loops on permanent errors. |
| ASY04 | Dead-Letter Isolation & Poison Pill Handling | Route exhausted or permanently unprocessable messages to a Dead-Letter Queue (DLQ) without blocking partitions. |
| ASY05 | Partition Ordering & Sequential Monotonicity | Enforce partitioning keys and sequence guards when business contracts require strict message ordering. |
| ASY06 | Consumer Concurrency & Backpressure Limits | Bound concurrent worker tasks and thread pools to prevent memory exhaustion and downstream service saturation. |
| ASY07 | Worker Graceful Shutdown & Cancellation | Propagate cancellation tokens and await in-flight task completion before process termination. |
| ASY08 | Transactional Outbox & Publication Durability | Ensure database writes and outgoing message publication commit atomically without split-brain failure windows. |
| ASY09 | Context & Correlation ID Propagation | Propagate distributed tracing headers and correlation identifiers across asynchronous message boundaries. |
| ASY10 | Delivery Failure Testing & Recovery | Validate test coverage for transient retry exhaustion, poison pills, concurrent races, and redelivery duplicates. |

*Detailed criteria, evidence, and remediation per rule are defined in [`references/checklist.md`](references/checklist.md).*

## 4. Review Workflow

1. **Trace Delivery Paths**: Review changed diffs, trace message consumption from broker receipt through processing, database persistence, and acknowledgement.
2. **Establish Consequences**: Determine what happens during network disconnects, consumer crashes, database lock timeouts, or duplicate deliveries.
3. **Verify Contract & Boundaries**: Confirm whether the behavior violates durable delivery guarantees, idempotency, concurrency bounds, or graceful shutdown.
4. **Evaluate Evidence**: Consult [`references/checklist.md`](references/checklist.md) to substantiate findings with visible code patterns.
5. **Score & Deduplicate**: Apply [`references/scoring-guide.md`](references/scoring-guide.md). Consolidate multiple symptoms sharing a single root cause into one finding.
6. **Generate Output**: Format findings using the Scorecard Aggregator schema below.

## 5. Review Principles & False-Positive Safeguards

- **Evidence-Based**: Report async delivery defects supported by concrete code evidence; demonstrate plausible message loss, duplicate side effects, queue stalls, or crash loops.
- **Naturally Idempotent Operations**: Do not flag missing deduplication tables if SQL mutations use natural keys, UPSERT (`ON CONFLICT DO UPDATE`), or idempotent state transitions.
- **Framework Auto-Ack**: Do not flag missing manual `ack()` calls when framework decorators or container configurations explicitly enforce post-execution auto-acknowledgement.
- **At-Most-Once Workloads**: Do not demand outboxes, retries, or DLQs for non-critical ephemeral telemetry, cache warmers, or best-effort log aggregators.
- **Verified Enclosing Retries**: Do not report missing consumer retry loops if the underlying broker (e.g., SQS redelivery policy, Kafka consumer retry topic) handles backoff externally.
- **Root-Cause Deduplication**: Multiple symptoms stemming from one underlying delivery defect must produce one primary finding.

## 6. Skill Boundaries & Delegation

- **Event Ingestion** ([`skill-eng-event-ingestion`](../skill-eng-event-ingestion/SKILL.md)): Webhook signature verification, replay protection, and initial HTTP request intake.
- **Error Handling** ([`skill-eng-error-handling`](../skill-eng-error-handling/SKILL.md)): Generic exception hierarchies, process crashes, and try/catch mechanics.
- **Observability** ([`skill-eng-observability`](../skill-eng-observability/SKILL.md)): Distributed tracing spans, metrics collection, and log format standards.
- **Security** ([`skill-eng-security`](../skill-eng-security/SKILL.md)): Message encryption, authorization tokens, and credentials security.
- **Data Access** ([`skill-eng-data-access-patterns`](../skill-eng-data-access-patterns/SKILL.md)): Database connection pooling, ORM mappings, and SQL query performance.
- **Cloud Integration** ([`skill-eng-cloud-integration`](../skill-eng-cloud-integration/SKILL.md)): Cloud SDK client initialization, IAM authentication, and bucket storage.

## 7. Output Contract & References

Return structured output compatible with the Code Review Portal Scorecard Aggregator:

```json
{
  "dimension": "async_delivery",
  "score": 8.0,
  "findings": [
    {
      "ruleId": "ASY01",
      "title": "Message Acknowledged Before Database Commit",
      "severity": "critical",
      "confidence": "high",
      "file": "src/consumers/order_consumer.py",
      "lineStart": 34,
      "lineEnd": 42,
      "evidence": "ch.basic_ack(delivery_tag) is called before db.commit(), causing message loss if the database crashes",
      "impact": "Uncommitted transactions lead to permanent data loss because RabbitMQ discards the acknowledged message",
      "recommendation": "Invoke basic_ack only after db.commit() successfully finishes within the transaction boundary",
      "technology": "Python",
      "status": "open"
    }
  ],
  "uncertainty_notes": [],
  "blocked": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `ruleId` | string | Yes | ASY01–ASY10 stable identifier |
| `title` | string | Yes | Concise issue summary |
| `severity` | string | Yes | `critical`, `high`, `medium`, or `low` |
| `confidence` | string | Yes | `high`, `medium`, or `low` |
| `file` | string | Yes | Repository-relative path |
| `lineStart` | integer | Yes | First line number of the relevant code |
| `lineEnd` | integer | No | End line number of the relevant code block |
| `evidence` | string | Yes | Concrete code observation supporting the issue |
| `impact` | string | Yes | Plausible reliability, data loss, or system stability impact |
| `recommendation` | string | Yes | Actionable remediation preserving valid behavior |
| `technology` | string | No | Inferred technology stack |
| `status` | string | No | Finding lifecycle status (default: `open`) |

Integration rules for the aggregator:
- `score` is calculated directly on a native 0.0–10.0 scale from start to finish without any intermediate 0–100 calculation or division, according to [`references/scoring-guide.md`](references/scoring-guide.md).
- `blocked` is set to `true` when the dimension score is below 9.0 (9/10) or when any confirmed critical violation is present.
- A score of 10.0 (10/10) indicates pass with zero violations; 9.0 (9/10) indicates pass with at most one minor non-blocking finding and no critical violations.
- Low-confidence observations must be recorded in `uncertainty_notes` and incur 0 deductions.

## 8. Supporting References

- **Inspection Checklist**: [`references/checklist.md`](references/checklist.md) — Detailed criteria, evidence, and remediation per rule.
- **Scoring Guide**: [`references/scoring-guide.md`](references/scoring-guide.md) — Severity tiers, deduction formulas, exceptions, and merge blocking.
- **Validation Suite**: [`validation/test-suite.json`](validation/test-suite.json) — Automated test cases for detection and false-positive verification.

