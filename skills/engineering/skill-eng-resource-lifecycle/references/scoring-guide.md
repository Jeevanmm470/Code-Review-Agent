# Resource Lifecycle Scoring Guide & Scorecard Aggregator Reference

This guide defines how findings from `SKILL.md` rules RES01–RES10 are classified and how the resource lifecycle dimension score and merge-blocking decisions are calculated directly on a native **0.0–10.0 scale** for the Code Review Portal's Scorecard Aggregator.

---

## 1. Severity Classification & Base Deductions

Severity reflects the **demonstrated impact** of the resource lifecycle defect on system stability, memory retention, file descriptor availability, deadlock risk, and leak prevention across rules RES01–RES10 (e.g. unclosed file descriptors RES01, exception bypassing stream close RES02, partial initialization resource leaks RES03, premature async disposal RES04, unreleased synchronization primitives and deadlocks RES05, socket exhaustion from unpooled client instantiation RES06, zombie child processes RES07, orphaned temporary files RES08, unmanaged listeners and timers RES09, and missing test cleanup fixtures RES10).

| Severity | Base Deduction (0–10 Scale) | Definition & Operational Impact |
|---|---|---|
| **critical** | 6.0 | Severe defect causing system deadlock (unreleased lock in exception path RES05), cross-tenant credential leakage, or rapid critical resource exhaustion. Triggers unconditional merge block. |
| **high** | 4.0 | Major reliability defect: unclosed native streams/descriptors (RES01/RES02), partial initialization leaks (RES03), premature async disposal (RES04), or zombie subprocess accumulation (RES07). |
| **medium** | 2.0 | Moderate defect: client instantiation per loop instead of pooling (RES06), temporary file leakage on disk (RES08), or missing event/timer unregistration (RES09). |
| **low** | 1.0 | Minor issue: missing explicit lifecycle test assertions or incomplete test fixture cleanup (RES10). |

---

## 2. Confidence and Uncertainty Handling

Confidence measures how strongly code evidence supports a finding:

| Confidence | Multiplier | Definition |
|---|---|---|
| **high** | 1.00 | Finding is directly visible in the diff with unambiguous evidence of defect and impact. |
| **medium** | 0.70 | Pattern is visibly defective, but enclosing framework, middleware, or caller lifecycle management is only partially visible. |
| **low** | 0.30 | Concern is speculative or depends on unverified assumptions about framework disposal. |

**Low-confidence concerns must not be reported as findings.** Instead, record an `uncertainty_note` at the dimension level (0.0 score deduction).

---

## 3. Native 0–10 Score Calculation

Resource lifecycle scores are calculated directly on a **0.0 to 10.0 scale** from start to finish without any intermediate 0–100 calculation or division:

```
deduction = round(base_deduction × confidence_multiplier)
final_score = max(0.0, min(10.0, 10.0 - sum(deductions)))
```

- **Starting Score:** Initialized at `10.0`.
- **Deductions:** Applied directly on the 0–10 scale.
- **Precision:** Rounded to one decimal place (`X.X`) and clamped within `[0.0, 10.0]`.

### Deduplication and Documented Exceptions
- **Duplicate Findings:** Multiple symptoms stemming from one underlying resource lifecycle defect produce **one primary finding** under the most specific applicable rule ID (RES01–RES10).
- **Approved Exceptions:** Documented trade-offs reduce deductions by **50%** with `status: "accepted"`.

---

## 4. Standard Scoring and Blocking Rubric

The resource lifecycle review enforces the standard merge-blocking policy:

| Score | Status | Description & Blocking Rule |
|---|---|---|
| **10.0 (10/10)** | ✅ **Pass** | **Zero confirmed violations.** Clean, deterministic, and leak-free resource lifecycle management. |
| **9.0 (9/10)** | ✅ **Pass with minor issues** | **At most one minor (low) non-blocking violation.** No medium, high, or critical lifecycle risks. |
| **< 9.0 (< 9/10)** | ❌ **Rejected / Blocked** | **Merge blocked.** Any critical violation or cumulative high/medium violations reducing score below 9.0. |

---

## 5. Scorecard Output Example

```json
{
  "dimension": "resource_lifecycle",
  "score": 4.0,
  "findings": [
    {
      "ruleId": "RES05",
      "title": "Lock Acquired Without Finally Block Causing Deadlock",
      "severity": "critical",
      "confidence": "high",
      "file": "src/services/account_service.py",
      "lineStart": 10,
      "lineEnd": 17,
      "evidence": "lock.acquire() is not wrapped in a try/finally block or with statement; exceptions leave lock held indefinitely",
      "impact": "Deadlocks all subsequent threads calling transfer(), leading to complete application hang",
      "recommendation": "Use 'with self._lock:' context manager to guarantee automatic lock release on error",
      "technology": "Python",
      "status": "open"
    }
  ],
  "uncertainty_notes": [],
  "blocked": true
}
```

