# Test Quality Scoring Guide & Scorecard Aggregator Reference

This guide defines how findings from `SKILL.md` rules TST01–TST10 are classified and how the test quality dimension score and merge-blocking decisions are calculated directly on a native **0.0–10.0 scale** for the Code Review Portal's Scorecard Aggregator.

---

## 1. Severity Classification & Base Deductions

Severity reflects the **demonstrated impact** of the test quality defect on defect escape probability, regression risk, CI pipeline flakiness, and test suite reliability across rules TST01–TST10 (e.g. assertion-free test TST01, missing regression test for bug fix TST02, unverified failure paths TST03, test pollution and shared state leaks TST04, over-mocking business logic TST05, flaky time sleeps TST06, missing contract/integration boundaries TST07, obscure hardcoded fixtures TST08, unawaited async tests TST09, and inadequate coverage on high-risk domain logic TST10).

| Severity | Base Deduction (0–10 Scale) | Definition & Operational Impact |
|---|---|---|
| **critical** | 6.0 | Severe defect: zero testing on critical financial/security transactions, or test pollution causing cascading suite failures across all CI builds. Triggers unconditional merge block. |
| **high** | 4.0 | Major quality defect: assertion-free test execution (TST01), missing regression test for complex bug fix (TST02), unawaited async tests causing false positives (TST09), or single trivial test on high-risk calculations (TST10). |
| **medium** | 2.0 | Moderate defect: over-mocking hiding real integration bugs (TST05), non-deterministic sleeps causing flaky CI runs (TST06), or unverified error branches (TST03). |
| **low** | 1.0 | Minor issue: hardcoded local test paths or obscure oversized fixture objects (TST08). |

---

## 2. Confidence and Uncertainty Handling

Confidence measures how strongly code evidence supports a finding:

| Confidence | Multiplier | Definition |
|---|---|---|
| **high** | 1.00 | Finding is directly visible in the diff with unambiguous evidence of assertion defect or missing regression test. |
| **medium** | 0.70 | Test gap is visible in changed files, but shared suite test coverage or end-to-end integration tests are only partially visible. |
| **low** | 0.30 | Concern is speculative or assumes unverified edge cases without clear domain risk. |

**Low-confidence concerns must not be reported as findings.** Instead, record an `uncertainty_note` at the dimension level (0.0 score deduction).

---

## 3. Native 0–10 Score Calculation

Test quality scores are calculated directly on a **0.0 to 10.0 scale** from start to finish without any intermediate 0–100 calculation or division:

```
deduction = round(base_deduction × confidence_multiplier)
final_score = max(0.0, min(10.0, 10.0 - sum(deductions)))
```

- **Starting Score:** Initialized at `10.0`.
- **Deductions:** Applied directly on the 0–10 scale.
- **Precision:** Rounded to one decimal place (`X.X`) and clamped within `[0.0, 10.0]`.

### Deduplication and Documented Exceptions
- **Duplicate Findings:** Multiple weak assertions in a single test file produce **one primary finding** under the most specific applicable rule ID (TST01–TST10).
- **Approved Exceptions:** Documented prototype components or legacy test debt reduce deductions by **50%** with `status: "accepted"`.

---

## 4. Standard Scoring and Blocking Rubric

The test quality review enforces the standard merge-blocking policy:

| Score | Status | Description & Blocking Rule |
|---|---|---|
| **10.0 (10/10)** | ✅ **Pass** | **Zero confirmed violations.** Robust, deterministic, and effective test coverage. |
| **9.0 (9/10)** | ✅ **Pass with minor issues** | **At most one minor (low) non-blocking violation.** No medium, high, or critical testing risks. |
| **< 9.0 (< 9/10)** | ❌ **Rejected / Blocked** | **Merge blocked.** Any critical violation or cumulative high/medium violations reducing score below 9.0. |

---

## 5. Scorecard Output Example

```json
{
  "dimension": "test_quality",
  "score": 4.0,
  "findings": [
    {
      "ruleId": "TST01",
      "title": "Assertion-Free Test Method",
      "severity": "high",
      "confidence": "high",
      "file": "tests/test_payment.py",
      "lineStart": 14,
      "lineEnd": 22,
      "evidence": "test_charge_customer() invokes service.charge() but contains no assertions verifying result or charge record",
      "impact": "Test passes even if charge fails or double-charges, concealing regressions",
      "recommendation": "Assert payment transaction status is 'succeeded' and correct charge amount was persisted",
      "technology": "Python",
      "status": "open"
    }
  ],
  "uncertainty_notes": [],
  "blocked": true
}
```

