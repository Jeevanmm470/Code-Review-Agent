# Error Handling Scoring Guide

This guide defines how findings from `SKILL.md` rules ERR01–ERR10 are classified and how the error handling dimension score and merge-blocking decisions are calculated directly on a native **0.0–10.0 scale** for the Code Review Portal's Scorecard Aggregator.

---

## 1. Severity Classification & Base Deductions

Severity reflects the **demonstrated impact** of the error handling defect on system reliability, data consistency, security, and diagnosability across rules ERR01–ERR10 (e.g. swallowed errors ERR01, broad catches ERR02, destructive rethrows ERR03, misclassified status ERR04, information leakage ERR05, unsafe fallbacks ERR06, unsafe retries ERR07, unhandled async errors ERR08, transaction rollback failures ERR09, and missing error boundaries ERR10).

| Severity | Base Deduction (0–10 Scale) | Definition & Operational Impact |
|---|---|---|
| **critical** | 6.0 | Severe defect causing silent data loss, financial inconsistency, unauthorized state changes, transaction rollback failures, or credentials leakage. Triggers unconditional merge block. |
| **high** | 4.0 | Major reliability defect: unhandled async exceptions killing worker threads, unbounded retry loops, permanent error retries, or swallowed exceptions masking system failures. |
| **medium** | 2.0 | Moderate defect: destructive exception wrapping resetting stack traces, misclassified API status codes, or unhandled non-critical background promises. |
| **low** | 1.0 | Minor issue: missing non-critical context in custom exception message, or slight status code imprecision without operational impact. |

---

## 2. Confidence and Uncertainty Handling

Confidence measures how strongly code evidence supports a finding:

| Confidence | Multiplier | Definition |
|---|---|---|
| **high** | 1.00 | Finding is directly visible in the diff with unambiguous evidence of defect and impact. |
| **medium** | 0.70 | Pattern is visibly defective, but enclosing framework or caller recovery logic is only partially visible. |
| **low** | 0.30 | Concern is speculative or depends on unverified assumptions about caller behavior. |

**Low-confidence concerns must not be reported as findings.** Instead, record an `uncertainty_note` at the dimension level (0.0 score deduction).

---

## 3. Native 0–10 Score Calculation

Error handling scores are calculated directly on a **0.0 to 10.0 scale** from start to finish without any intermediate 0–100 calculation or division:

```
deduction = round(base_deduction × confidence_multiplier)
final_score = max(0.0, min(10.0, 10.0 - sum(deductions)))
```

- **Starting Score:** Initialized at `10.0`.
- **Deductions:** Applied directly on the 0–10 scale.
- **Precision:** Rounded to one decimal place (`X.X`) and clamped within `[0.0, 10.0]`.

### Deduplication and Documented Exceptions
- **Duplicate Findings:** Multiple symptoms stemming from one underlying error-handling defect produce **one primary finding** under the most specific applicable rule ID (ERR01–ERR10).
- **Approved Exceptions:** Documented trade-offs (e.g. deliberate third-party swallow with explanatory comment) reduce deductions by **50%** with `status: "accepted"`.

---

## 4. Standard Scoring and Blocking Rubric

The error handling review enforces the standard merge-blocking policy:

| Score | Status | Description & Blocking Rule |
|---|---|---|
| **10.0 (10/10)** | ✅ **Pass** | **Zero confirmed violations.** Robust, reliable, and well-structured error handling. |
| **9.0 (9/10)** | ✅ **Pass with minor issues** | **At most one minor (low) non-blocking violation.** No medium, high, or critical error handling risks. |
| **Below 9.0 (< 9/10)** | 🔴 **Block** | **Merge Blocked (`blocked: true`).** Two or more minor issues, or any medium/high violation. |
| **Critical Override** | 🔴 **Block** | **Merge Blocked (`blocked: true`).** Any confirmed critical violation blocks merge unconditionally regardless of numeric score. |

---

## 5. Scorecard Aggregator Integration & Global Review Decision

The error handling review skill produces an evaluation object conforming to the global Scorecard Aggregator contract using native 0–10 scoring:

```json
{
  "dimension": "error_handling",
  "score": 9.0,
  "findings": [
    {
      "ruleId": "ERR03",
      "title": "Exception Rethrow Resets Call Stack",
      "severity": "low",
      "confidence": "high",
      "file": "src/utils/parser.cs",
      "lineStart": 22,
      "lineEnd": 28,
      "evidence": "throw ex; inside catch block resets stack trace to parser.cs instead of preserving origin",
      "impact": "Original stack trace lost during debugging",
      "recommendation": "Use throw; to preserve original stack trace",
      "technology": "C#",
      "status": "open"
    }
  ],
  "uncertainty_notes": [],
  "blocked": false
}
```

### Global Review Decision
1. **Dimension Evaluation:** Returns `score` (0.0–10.0) and `blocked` (`blocked: true` if score $< 9.0$ or critical violation present).
2. **Global Aggregate:** The global review passes **only if every evaluated dimension passes** ($\text{score} \ge 9.0$ and $\text{blocked} = \text{false}$). If any dimension is blocked, the global review is marked blocked.

