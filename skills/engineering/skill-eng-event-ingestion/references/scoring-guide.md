# Event Ingestion and Webhook Safety Scoring Guide

This guide defines how findings from `SKILL.md` rules EVT01–EVT10 are classified and how the event ingestion dimension score and merge-blocking decisions are calculated directly on a native **0.0–10.0 scale** for the Code Review Portal's Scorecard Aggregator.

---

## 1. Severity Classification & Base Deductions

Severity reflects the **demonstrated impact** of the event ingestion defect on system reliability, data consistency, security, and integrity across rules EVT01–EVT10 (e.g. missing signature verification EVT01, secret leakage EVT02, payload validation gaps EVT03, duplicate execution EVT04, webhook timeout EVT05, replay attacks EVT06, out-of-order state corruption EVT07, cross-tenant escalation EVT08, SSRF vulnerability EVT09, and poison pill queue blockage EVT10).

| Severity | Base Deduction (0–10 Scale) | Definition & Operational Impact |
|---|---|---|
| **critical** | 6.0 | Severe defect causing signature bypass, hardcoded secrets, cross-tenant data corruption, double-charging side effects, or SSRF attacks. Triggers unconditional merge block. |
| **high** | 4.0 | Major reliability defect: non-idempotent event processing, synchronous long-running tasks causing webhook timeouts, replay window vulnerability, or poison-pill consumer crashes. |
| **medium** | 2.0 | Moderate defect: unbounded payload sizes without size limits, missing content-type validation, or missing correlation ID propagation. |
| **low** | 1.0 | Minor issue: slight timestamp tolerance imprecision or suboptimal retry backoff timing without operational failure. |

---

## 2. Confidence and Uncertainty Handling

Confidence measures how strongly code evidence supports a finding:

| Confidence | Multiplier | Definition |
|---|---|---|
| **high** | 1.00 | Finding is directly visible in the diff with unambiguous evidence of defect and impact. |
| **medium** | 0.70 | Pattern is visibly defective, but enclosing framework or middleware verification is only partially visible. |
| **low** | 0.30 | Concern is speculative or depends on unverified assumptions about caller behavior. |

**Low-confidence concerns must not be reported as findings.** Instead, record an `uncertainty_note` at the dimension level (0.0 score deduction).

---

## 3. Native 0–10 Score Calculation

Event ingestion scores are calculated directly on a **0.0 to 10.0 scale** from start to finish without any intermediate 0–100 calculation or division:

```
deduction = round(base_deduction × confidence_multiplier)
final_score = max(0.0, min(10.0, 10.0 - sum(deductions)))
```

- **Starting Score:** Initialized at `10.0`.
- **Deductions:** Applied directly on the 0–10 scale.
- **Precision:** Rounded to one decimal place (`X.X`) and clamped within `[0.0, 10.0]`.

### Deduplication and Documented Exceptions
- **Duplicate Findings:** Multiple symptoms stemming from one underlying ingestion defect produce **one primary finding** under the most specific applicable rule ID (EVT01–EVT10).
- **Approved Exceptions:** Documented trade-offs (e.g. deliberate internal-only unverified event bus with explanatory comment) reduce deductions by **50%** with `status: "accepted"`.

---

## 4. Standard Scoring and Blocking Rubric

The event ingestion review enforces the standard merge-blocking policy:

| Score | Status | Description & Blocking Rule |
|---|---|---|
| **10.0 (10/10)** | ✅ **Pass** | **Zero confirmed violations.** Robust, reliable, and secure webhook/event ingestion handling. |
| **9.0 (9/10)** | ✅ **Pass with minor issues** | **At most one minor (low) non-blocking violation.** No medium, high, or critical ingestion risks. |
| **< 9.0 (< 9/10)** | ❌ **Rejected / Blocked** | **Merge blocked.** Any critical violation or cumulative high/medium violations reducing score below 9.0. |

---

## 5. Scorecard Output Example

```json
{
  "dimension": "event_ingestion",
  "score": 4.0,
  "findings": [
    {
      "ruleId": "EVT01",
      "title": "Webhook Signature Verification on Parsed JSON",
      "severity": "critical",
      "confidence": "high",
      "file": "src/webhooks/receiver.py",
      "lineStart": 25,
      "lineEnd": 32,
      "evidence": "Payload is parsed as JSON before HMAC verification using standard '==' equality operator.",
      "impact": "Signature verification fails or allows payload tampering due to key ordering differences in JSON serialization.",
      "recommendation": "Verify raw request body bytes directly with hmac.compare_digest before parsing JSON.",
      "technology": "Python",
      "status": "open"
    }
  ],
  "uncertainty_notes": [],
  "blocked": true
}
```

