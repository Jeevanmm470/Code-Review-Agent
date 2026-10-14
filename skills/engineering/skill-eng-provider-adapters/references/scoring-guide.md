# Provider Adapters Scoring Guide

This guide defines how findings from `SKILL.md` rules ADP01–ADP10 are classified and how the provider adapters dimension score and merge-blocking decisions are calculated directly on a native **0.0–10.0 scale** for the Code Review Portal's Scorecard Aggregator.

---

## 1. Severity Classification & Base Deductions

Severity reflects the **demonstrated impact** of the provider adapter defect on domain isolation, substitutability, correctness, and security across rules ADP01–ADP10 (e.g. leaking SDK classes ADP01, inconsistent status normalization ADP02, silent unsupported operations ADP03, unvalidated provider selection ADP04, unhandled provider exceptions ADP05, broken pagination traversal ADP06, unaligned rate limits ADP07, cross-tenant token contamination ADP08, brittle enum parsing ADP09, and missing contract test coverage ADP10).

| Severity | Base Deduction (0–10 Scale) | Definition & Operational Impact |
|---|---|---|
| **critical** | 6.0 | Severe defect causing cross-tenant credential leakage, unauthorized provider selection bypass, or security boundary contamination. Triggers unconditional merge block. |
| **high** | 4.0 | Major architectural/correctness defect: provider SDK types leaking into domain core, inconsistent status mappings causing workflow errors, silent no-op on unsupported features, or unhandled provider exceptions. |
| **medium** | 2.0 | Moderate defect: unhandled rate limit headers, brittle enum deserialization, or missing multi-provider contract test coverage. |
| **low** | 1.0 | Minor issue: slight field naming imprecision or minor diagnostic log omission without operational impact. |

---

## 2. Confidence and Uncertainty Handling

Confidence measures how strongly code evidence supports a finding:

| Confidence | Multiplier | Definition |
|---|---|---|
| **high** | 1.00 | Finding is directly visible in the diff with unambiguous evidence of defect and impact. |
| **medium** | 0.70 | Pattern is visibly defective, but enclosing framework, mapper utility, or caller abstraction is only partially visible. |
| **low** | 0.30 | Concern is speculative or depends on unverified assumptions about provider capability. |

**Low-confidence concerns must not be reported as findings.** Instead, record an `uncertainty_note` at the dimension level (0.0 score deduction).

---

## 3. Native 0–10 Score Calculation

Provider adapter scores are calculated directly on a **0.0 to 10.0 scale** from start to finish without any intermediate 0–100 calculation or division:

```
deduction = round(base_deduction × confidence_multiplier)
final_score = max(0.0, min(10.0, 10.0 - sum(deductions)))
```

- **Starting Score:** Initialized at `10.0`.
- **Deductions:** Applied directly on the 0–10 scale.
- **Precision:** Rounded to one decimal place (`X.X`) and clamped within `[0.0, 10.0]`.

### Deduplication and Documented Exceptions
- **Duplicate Findings:** Multiple symptoms stemming from one underlying adapter defect produce **one primary finding** under the most specific applicable rule ID (ADP01–ADP10).
- **Approved Exceptions:** Documented trade-offs (e.g. deliberate provider-specific extension with explanatory comment) reduce deductions by **50%** with `status: "accepted"`.

---

## 4. Standard Scoring and Blocking Rubric

The provider adapter review enforces the standard merge-blocking policy:

| Score | Status | Description & Blocking Rule |
|---|---|---|
| **10.0 (10/10)** | ✅ **Pass** | **Zero confirmed violations.** Clean, decoupled, and substitutable provider adapters. |
| **9.0 (9/10)** | ✅ **Pass with minor issues** | **At most one minor (low) non-blocking violation.** No medium, high, or critical adapter risks. |
| **< 9.0 (< 9/10)** | ❌ **Rejected / Blocked** | **Merge blocked.** Any critical violation or cumulative high/medium violations reducing score below 9.0. |

---

## 5. Scorecard Output Example

```json
{
  "dimension": "provider_adapters",
  "score": 4.0,
  "findings": [
    {
      "ruleId": "ADP01",
      "title": "PyGithub SDK Type Leaked in Domain Interface",
      "severity": "high",
      "confidence": "high",
      "file": "src/services/pr_service.py",
      "lineStart": 42,
      "lineEnd": 48,
      "evidence": "Method returns github.PullRequest.PullRequest directly from PyGithub into domain business logic.",
      "impact": "Ties application core logic to PyGithub SDK types, preventing substitution with GitLab or Bitbucket adapters.",
      "recommendation": "Map github.PullRequest into internal CanonicalPullRequest domain dataclass before returning from adapter.",
      "technology": "Python",
      "status": "open"
    }
  ],
  "uncertainty_notes": [],
  "blocked": true
}
```

