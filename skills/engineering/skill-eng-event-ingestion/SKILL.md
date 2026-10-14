---
name: skill-eng-event-ingestion
description: >-
  Activate when reviewing code changes for event ingestion endpoints, webhook handlers,
  message queue consumers, and stream processors across Python, Java, C#, Go, and TypeScript.
  Evaluates cryptographic signature verification, secret protection, atomic deduplication,
  timely HTTP acknowledgment, ordering invariants, tenant authorization, payload validation,
  SSRF prevention, and dead-letter queue isolation without enforcing subjective style preferences.
---

# Engineering Event Ingestion and Webhook Safety Skill

## 1. Purpose & Activation

This skill evaluates pull requests and code modifications for defects in webhook receivers, event ingestion endpoints, message queue consumers, and asynchronous event streams across backend services, distributed data pipelines, and third-party integrations.

**Activate when** code changes modify webhook signature checks, ingestion controllers, event consumers, deduplication caches, outbox tables, delivery timestamp validations, callback URL requests, or dead-letter queue (DLQ) handlers; or when review context cites webhook timeouts, replay vulnerabilities, duplicate side effects, SSRF, or poison pill consumer crashes.

Do not report findings merely because endpoints trust internal RPC calls over authenticated mutual TLS, use standard framework body parsers, or delegate webhook deduplication to transactional downstream services.

## 2. Technology Context

Infer the relevant technology from the supplied code and repository context. Apply cross-language event ingestion principles across supported languages (Python, Java, C#, TypeScript/JavaScript, Go) and messaging frameworks (Kafka, SQS, RabbitMQ, Celery), adapting review criteria to provider-specific webhook standards (Stripe, GitHub, Shopify, Slack).

Refer to [`references/checklist.md`](references/checklist.md) for technology-specific detection patterns and examples.

Technology context guides how rules are applied; it is not a standalone review objective. Report only evidence-based event ingestion defects, not findings based solely on language idioms.

## 3. Event Ingestion Rules

| ID | Rule | Objective |
|---|---|---|
| EVT01 | Webhook Signature Verification | Verify webhook signatures using timing-safe comparisons against raw unparsed request bytes before processing. |
| EVT02 | Secret Protection and Safe Transport | Never accept webhook signing secrets via query parameters, and never log raw secrets or Authorization headers. |
| EVT03 | Payload and Header Schema Validation | Enforce strict size limits, expected Content-Type, and structural schema validation on all inbound event payloads. |
| EVT04 | Event Idempotency and Deduplication | Enforce atomic deduplication using provider event IDs or unique message keys before executing side effects. |
| EVT05 | Timely Acknowledgment and Async Queueing | Acknowledge webhooks quickly after durable queuing; avoid synchronous long-running tasks in receiver path. |
| EVT06 | Timestamp Validation and Replay Defense | Validate timestamp headers against a tight clock drift tolerance (e.g., ±5 min) to prevent replay attacks. |
| EVT07 | Delivery Ordering and Monotonic Sequencing | Check event sequencing or version timestamps before applying state mutations to prevent out-of-order overwrites. |
| EVT08 | Tenant Scoping and Resource Authorization | Scope event processing explicitly to verified tenant boundaries; do not trust arbitrary resource IDs in payload. |
| EVT09 | URL Callback and SSRF Defense | Sanitize, restrict schemes, and validate IP addresses for any callback URLs or resource fetch endpoints in payloads. |
| EVT10 | Error Boundaries and Dead-Letter Isolation | Route unprocessable or poison payloads to a Dead-Letter Queue (DLQ) without crashing consumers or blocking streams. |

*Detailed criteria, evidence, and remediation per rule are defined in [`references/checklist.md`](references/checklist.md).*

## 4. Review Workflow

1. **Trace Ingestion Paths**: Review changed diffs, trace execution flow through HTTP ingress, signature validation, and payload deserialization.
2. **Establish Consequences**: Determine what happens during processing: queueing, deduplication, retry, synchronous execution, or callback fetch.
3. **Verify Contract & Boundaries**: Confirm whether the behavior violates cryptographic authenticity, idempotency, tenant scoping, or delivery ordering.
4. **Evaluate Evidence**: Consult [`references/checklist.md`](references/checklist.md) to substantiate findings with visible code patterns.
5. **Score & Deduplicate**: Apply [`references/scoring-guide.md`](references/scoring-guide.md). Consolidate multiple symptoms sharing a single root cause into one finding.
6. **Generate Output**: Format findings using the Scorecard Aggregator schema below.

## 5. Review Principles & False-Positive Safeguards

- **Evidence-Based**: Report event ingestion defects supported by concrete code evidence; demonstrate plausible forged requests, replay attacks, duplicate side effects, or consumer crashes.
- **Internal RPC Endpoints Are Safe**: Do not demand HMAC webhook signature checks on internal service-to-service endpoints secured by mTLS or API gateways.
- **Naturally Idempotent Operations**: Do not flag missing deduplication tables if the underlying operation is naturally idempotent (e.g., SQL `UPDATE ... WHERE ...` with identical state values or UPSERT).
- **Lightweight Handlers Can Be Synchronous**: Handlers performing only quick non-blocking in-memory checks before responding do not require async message brokers.
- **Framework Signature Middleware**: Do not demand local HMAC verification when a framework filter or decorator (e.g., `@StripeWebhookValidator`) handles cryptographic verification globally.
- **Root-Cause Deduplication**: Multiple symptoms stemming from one underlying ingestion defect must produce one primary finding.

## 6. Skill Boundaries & Delegation

- **Security** ([`skill-eng-security`](../skill-eng-security/SKILL.md)): Generic OWASP vulnerabilities, static credential scanning, and application auth tokens.
- **Data Access** ([`skill-eng-data-access-patterns`](../skill-eng-data-access-patterns/SKILL.md)): General SQL transaction semantics, database indexing, and ORM query optimization.
- **Error Handling** ([`skill-eng-error-handling`](../skill-eng-error-handling/SKILL.md)): General exception hierarchies, catch blocks, and uncaught process panics.
- **Observability** ([`skill-eng-observability`](../skill-eng-observability/SKILL.md)): Distributed tracing propagation, metrics collectors, and logging formats.
- **Business Logic** ([`skill-eng-business-logic`](../skill-eng-business-logic/SKILL.md)): Domain rule calculation and business specification adherence.

## 7. Output Contract & References

Return structured output compatible with the Code Review Portal Scorecard Aggregator:

```json
{
  "dimension": "event_ingestion",
  "score": 8.0,
  "findings": [
    {
      "ruleId": "EVT01",
      "title": "Webhook Signature Verified on Deserialized Payload",
      "severity": "critical",
      "confidence": "high",
      "file": "src/webhooks/stripe_handler.py",
      "lineStart": 24,
      "lineEnd": 32,
      "evidence": "hmac.new(secret, json.dumps(payload).encode()) verifies re-serialized JSON rather than raw request bytes",
      "impact": "Signature verification fails or allows payload tampering due to key ordering differences in JSON serialization",
      "recommendation": "Verify HMAC against raw request body bytes (request.get_data()) using constant-time comparison",
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
| `ruleId` | string | Yes | EVT01–EVT10 stable identifier |
| `title` | string | Yes | Concise issue summary |
| `severity` | string | Yes | `critical`, `high`, `medium`, or `low` |
| `confidence` | string | Yes | `high`, `medium`, or `low` |
| `file` | string | Yes | Repository-relative path |
| `lineStart` | integer | Yes | First line number of the relevant code |
| `lineEnd` | integer | No | End line number of the relevant code block |
| `evidence` | string | Yes | Concrete code observation supporting the issue |
| `impact` | string | Yes | Plausible reliability, security, or data consistency impact |
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

