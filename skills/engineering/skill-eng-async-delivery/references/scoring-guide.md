# Async Delivery and Background Processing Scoring Guide

This guide defines how findings from `SKILL.md` rules ASY01–ASY10 are classified and how the async delivery dimension score and merge-blocking decisions are calculated directly on a native **0.0–10.0 scale** for the Code Review Portal's Scorecard Aggregator.

---

## 1. Severity Classification & Base Deductions

Severity reflects the **demonstrated impact** of the asynchronous delivery defect on system reliability, message durability, data integrity, and operational resilience across rules ASY01–ASY10 (e.g. premature acknowledgement message loss ASY01, duplicate non-idempotent side effects ASY02, tight retry loops ASY03, poison pill queue lockups ASY04, out-of-order execution ASY05, unbounded memory consumption ASY06, abrupt termination task loss ASY07, dual-write split-brain ASY08, lost trace correlation ASY09, and missing failure recovery tests ASY10).

| Severity | Base Deduction (0–10 Scale) | Definition & Operational Impact |
|---|---|---|
| **critical** | 6.0 | Severe defect causing permanent message loss (premature ack), duplicate non-idempotent financial transactions/charges, or persistent state corruption. Triggers unconditional merge block. |
| **high** | 4.0 | Major reliability defect: tight retry loops amplifying outages, poison pill payloads blocking queue partitions, out-of-order state mutations, unbounded worker memory growth, or dual-write inconsistency. |
| **medium** | 2.0 | Moderate defect: missing correlation ID propagation across queue boundaries or lack of failure-mode / redelivery test coverage. |
| **low** | 1.0 | Minor issue: slight backoff timing imprecision or minor naming discrepancy in queue metadata. |

---

## 2. Confidence and Uncertainty Handling

Confidence measures how strongly code evidence supports a finding:

| Confidence | Multiplier | Definition |
|---|---|---|
| **high** | 1.00 | Finding is directly visible in the diff with unambiguous evidence of defect and impact. |
| **medium** | 0.70 | Pattern is visibly defective, but enclosing framework, broker retry policies, or caller recovery logic is only partially visible. |
| **low** | 0.30 | Concern is speculative or depends on unverified assumptions about runtime queue broker configuration. |

**Low-confidence concerns must not be reported as findings.** Instead, record an `uncertainty_note` at the dimension level (0.0 score deduction).

---

## 3. Native 0–10 Score Calculation

Async delivery scores are calculated directly on a **0.0 to 10.0 scale** from start to finish without any intermediate 0–100 calculation or division:

```
deduction = round(base_deduction × confidence_multiplier)
final_score = max(0.0, min(10.0, 10.0 - sum(deductions)))
```

- **Starting Score:** Initialized at `10.0`.
- **Deductions:** Applied directly on the 0–10 scale.
- **Precision:** Rounded to one decimal place (`X.X`) and clamped within `[0.0, 10.0]`.

### Deduplication and Documented Exceptions
- **Duplicate Findings:** Multiple symptoms stemming from one underlying delivery defect produce **one primary finding** under the most specific applicable rule ID (ASY01–ASY10).
- **Approved Exceptions:** Documented trade-offs (e.g. deliberate at-most-once telemetry queue with explanatory comment) reduce deductions by **50%** with `status: "accepted"`.

---

## 4. Standard Scoring and Blocking Rubric

The async delivery review enforces the standard merge-blocking policy:

| Score | Status | Description & Blocking Rule |
|---|---|---|
| **10.0 (10/10)** | ✅ **Pass** | **Zero confirmed violations.** Robust, durable, and idempotent asynchronous message delivery. |
| **9.0 (9/10)** | ✅ **Pass with minor issues** | **At most one minor (low) non-blocking violation.** No medium, high, or critical delivery risks. |
| **< 9.0 (< 9/10)** | ❌ **Rejected / Blocked** | **Merge blocked.** Any critical violation or cumulative high/medium violations reducing score below 9.0. |

---

## 5. Scorecard Output Example

```json
{
  "dimension": "async_delivery",
  "score": 4.0,
  "findings": [
    {
      "ruleId": "ASY01",
      "title": "Message Acknowledged Before Database Commit",
      "severity": "critical",
      "confidence": "high",
      "file": "src/consumers/order_consumer.py",
      "lineStart": 34,
      "lineEnd": 42,
      "evidence": "ch.basic_ack(delivery_tag) is called before db.commit(), causing message loss if the database crashes.",
      "impact": "Uncommitted transactions lead to permanent data loss because RabbitMQ discards the acknowledged message.",
      "recommendation": "Invoke basic_ack only after db.commit() successfully finishes within the transaction boundary.",
      "technology": "Python",
      "status": "open"
    }
  ],
  "uncertainty_notes": [],
  "blocked": true
}
```

