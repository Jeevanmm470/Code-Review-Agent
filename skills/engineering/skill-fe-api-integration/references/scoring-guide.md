# Frontend API Integration Scoring Guide & Scorecard Aggregator Reference

This guide defines how findings from `SKILL.md` rules FAI01–FAI10 are classified and how the API integration dimension score and merge-blocking decisions are calculated directly on a native **0.0–10.0 scale** for the Code Review Portal's Scorecard Aggregator.

---

## 1. Severity Classification & Base Deductions

Severity reflects the **demonstrated operational impact** of frontend-to-API integration defects on network reliability, data integrity, user authentication, or request correctness across rules FAI01–FAI10 (e.g. malformed requests/unencoded params FAI01, contract mismatches/data loss FAI02, async race conditions FAI03, unhandled status codes/false successes FAI04, auth token deadlocks/infinite loops FAI05, duplicate non-idempotent mutations FAI06, pagination/infinite loops FAI07, uncleaned request lifecycles FAI08, stale cache keys FAI09, and interceptor header pollution FAI10).

| Severity | Base Deduction (0–10 Scale) | Definition & Operational Impact |
|---|---|---|
| **critical** | 6.0 | Severe defect: token refresh deadlock/infinite 401 loop (FAI05), credential leakage in query parameters, or catastrophic contract mismatch preventing core business operations. Triggers unconditional merge block. |
| **high** | 4.0 | Major reliability defect: async search race conditions overwriting UI (FAI03), unencoded query string breaking on special characters (FAI01), unhandled non-2xx status parsing errors (FAI04), duplicate non-idempotent form submissions (FAI06), missing cache invalidation leaving stale UI (FAI09), or interceptor state pollution (FAI10). |
| **medium** | 2.0 | Moderate defect: pagination loop or skipped page index (FAI07), missing AbortController on unmount causing minor memory leak (FAI08), or unvalidated nullable field parsing without crash (FAI02). |
| **low** | 1.0 | Minor issue: sub-optimal error message mapping or redundant header specification with no functional failure. |

---

## 2. Confidence and Uncertainty Handling

Confidence measures how strongly code evidence supports a finding:

| Confidence | Multiplier | Definition |
|---|---|---|
| **high** | 1.00 | Defect is directly visible in the diff with verifiable execution sequence demonstrating API failure or contract mismatch. |
| **medium** | 0.70 | Network defect or race-prone pattern is visible, but server endpoint contract or query middleware behavior is partially obscured. |
| **low** | 0.30 | Concern is speculative or assumes unverified backend failure modes without code evidence. |

**Low-confidence concerns must not be reported as findings.** Instead, record an `uncertainty_note` at the dimension level (0.0 score deduction).

---

## 3. Native 0–10 Score Calculation

Frontend API integration scores are calculated directly on a **0.0 to 10.0 scale** from start to finish without any intermediate 0–100 calculation or division:

```
deduction = round(base_deduction × confidence_multiplier)
final_score = max(0.0, min(10.0, 10.0 - sum(deductions)))
```

- **Starting Score:** Initialized at `10.0`.
- **Deductions:** Applied directly on the 0–10 scale.
- **Precision:** Rounded to one decimal place (`X.X`) and clamped within `[0.0, 10.0]`.

### Deduplication and Documented Exceptions
- **Duplicate Findings:** Multiple race conditions in a single API client module produce **one primary finding** under the most specific applicable rule ID (FAI01–FAI10).
- **Approved Exceptions:** Documented mock client fixtures or development proxies reduce deductions by **50%** with `status: "accepted"`.

---

## 4. Standard Scoring and Blocking Rubric

The API integration review enforces the standard merge-blocking policy:

| Score | Status | Description & Blocking Rule |
|---|---|---|
| **10.0 (10/10)** | ✅ **Pass** | **Zero confirmed violations.** Robust, typed, and resilient frontend API communications. |
| **9.0 (9/10)** | ✅ **Pass with minor issues** | **At most one minor (low) non-blocking violation.** No medium, high, or critical API integration defects. |
| **0.0 – 8.9** | ❌ **Merge Blocked** | **One or more medium, high, or critical violations confirmed.** Requires remediation before merge. |

---

## 5. Scorecard Aggregator Finding Format

```yaml
dimension: frontend_api_integration
score: 6.0 # 10.0 - 4.0 (1 High violation)
findings:
  - id: "FAI01"
    title: "Unencoded query parameters break endpoint on special characters"
    severity: "high"
    confidence: "high"
    file: "src/api/products.ts"
    line: 18
    line_range: [18, 26]
    description: "Search filter concatenates user input directly into the query URL without URI encoding, causing malformed requests when query contains '&' or spaces."
    evidence: "const url = `/api/products?search=${filterText}`; fetch(url)..."
    remediation: "Use URLSearchParams or encodeURIComponent to serialize query parameters safely."
```

