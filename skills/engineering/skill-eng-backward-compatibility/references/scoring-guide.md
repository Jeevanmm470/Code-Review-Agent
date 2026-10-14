# Backward Compatibility Scoring Guide & Scorecard Aggregator Reference

This guide defines how findings from `SKILL.md` rules BWC01–BWC10 are classified and how the backward compatibility dimension score and merge-blocking decisions are calculated directly on a native **0.0–10.0 scale** for the Code Review Portal's Scorecard Aggregator.

---

## 1. Severity Classification & Base Deductions

Severity reflects the **demonstrated impact** of the backward compatibility defect on active consumers, existing deployments, database availability, and data integrity across rules BWC01–BWC10 (e.g. endpoint/parameter breaking rename BWC01, tightening input constraints BWC02, response field removal BWC03, destructive single-step DB column drops BWC04, persistent deserialization failures BWC05, breaking event payload evolution BWC06, config/env var removals BWC07, breaking enum changes BWC08, behavioral regressions BWC09, and missing compatibility tests BWC10).

| Severity | Base Deduction (0–10 Scale) | Definition & Operational Impact |
|---|---|---|
| **critical** | 6.0 | Severe defect causing rolling deployment outages (destructive DB column drop BWC04), complete client communication failure, or persistent data loss. Triggers unconditional merge block. |
| **high** | 4.0 | Major breaking change: removing/renaming public parameters (BWC01), requiring new request fields without defaults (BWC02), deleting response properties (BWC03), breaking event schemas (BWC06), or failing deserialization of legacy data (BWC05). |
| **medium** | 2.0 | Moderate defect: removing legacy environment variable fallback (BWC07), breaking enum deserialization (BWC08), or altering default sorting/error semantics (BWC09). |
| **low** | 1.0 | Minor issue: missing explicit regression/compatibility test coverage for legacy formats (BWC10). |

---

## 2. Confidence and Uncertainty Handling

Confidence measures how strongly code evidence supports a finding:

| Confidence | Multiplier | Definition |
|---|---|---|
| **high** | 1.00 | Finding is directly visible in the diff with unambiguous evidence of breaking public contract change. |
| **medium** | 0.70 | Breaking pattern is visible, but client deprecation notices or upstream API gateway transformation rules are only partially visible. |
| **low** | 0.30 | Concern is speculative or assumes unverified third-party consumer reliance without clear public interface designation. |

**Low-confidence concerns must not be reported as findings.** Instead, record an `uncertainty_note` at the dimension level (0.0 score deduction).

---

## 3. Native 0–10 Score Calculation

Backward compatibility scores are calculated directly on a **0.0 to 10.0 scale** from start to finish without any intermediate 0–100 calculation or division:

```
deduction = round(base_deduction × confidence_multiplier)
final_score = max(0.0, min(10.0, 10.0 - sum(deductions)))
```

- **Starting Score:** Initialized at `10.0`.
- **Deductions:** Applied directly on the 0–10 scale.
- **Precision:** Rounded to one decimal place (`X.X`) and clamped within `[0.0, 10.0]`.

### Deduplication and Documented Exceptions
- **Duplicate Findings:** Multiple symptoms stemming from one underlying contract break produce **one primary finding** under the most specific applicable rule ID (BWC01–BWC10).
- **Approved Exceptions:** Documented major version increments or approved migration plans reduce deductions by **50%** with `status: "accepted"`.

---

## 4. Standard Scoring and Blocking Rubric

The backward compatibility review enforces the standard merge-blocking policy:

| Score | Status | Description & Blocking Rule |
|---|---|---|
| **10.0 (10/10)** | ✅ **Pass** | **Zero confirmed violations.** Seamless, backward-compatible evolution across all interfaces and schemas. |
| **9.0 (9/10)** | ✅ **Pass with minor issues** | **At most one minor (low) non-blocking violation.** No medium, high, or critical breaking risks. |
| **< 9.0 (< 9/10)** | ❌ **Rejected / Blocked** | **Merge blocked.** Any critical violation or cumulative high/medium violations reducing score below 9.0. |

---

## 5. Scorecard Output Example

```json
{
  "dimension": "backward_compatibility",
  "score": 4.0,
  "findings": [
    {
      "ruleId": "BWC04",
      "title": "Destructive Single-Step Database Column Drop",
      "severity": "critical",
      "confidence": "high",
      "file": "migrations/versions/20261014_drop_user_phone.py",
      "lineStart": 12,
      "lineEnd": 16,
      "evidence": "op.drop_column('users', 'phone_number') executed in a single migration without expand-and-contract phases",
      "impact": "Causes database query exceptions for currently running application pods during rolling deployments",
      "recommendation": "Use expand-and-contract migration strategy: keep column nullable until all pods are running the new version",
      "technology": "Python",
      "status": "open"
    }
  ],
  "uncertainty_notes": [],
  "blocked": true
}
```

