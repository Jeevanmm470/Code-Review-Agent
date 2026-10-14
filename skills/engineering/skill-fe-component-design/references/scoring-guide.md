# Frontend Component Design Scoring Guide & Scorecard Aggregator Reference

This guide defines how findings from `SKILL.md` rules FCD01–FCD10 are classified and how the component design dimension score and merge-blocking decisions are calculated directly on a native **0.0–10.0 scale** for the Code Review Portal's Scorecard Aggregator.

---

## 1. Severity Classification & Base Deductions

Severity reflects the **demonstrated operational and maintenance impact** of frontend component architecture defects across rules FCD01–FCD10 (e.g. god components FCD01, embedded domain logic in UI FCD02, parent-child encapsulation breaks FCD03, conflicting boolean prop contracts FCD04, deep prop-drilling FCD05, design system abstraction leakage FCD06, duplicated business logic FCD07, tangled lifecycle side effects FCD08, untestable components FCD09, and fragmented domain ownership FCD10).

| Severity | Base Deduction (0–10 Scale) | Definition & Operational Impact |
|---|---|---|
| **critical** | 6.0 | Severe defect: circular component imports causing runtime bundler deadlocks, or catastrophic encapsulation breakage crashing the application. Triggers unconditional merge block. |
| **high** | 4.0 | Major maintainability defect: god component combining 4+ disparate domains (FCD01), domain calculations embedded in JSX rendering expressions (FCD02), parent mutating child private state directly (FCD03), generic UI primitive leaking feature hacks (FCD06), untestable render-bound business logic (FCD09), or fragmented domain ownership (FCD10). |
| **medium** | 2.0 | Moderate defect: conflicting boolean prop flags creating invalid states (FCD04), deep 5+ level prop drilling (FCD05), duplicated validation logic across siblings (FCD07), or multi-purpose lifecycle side-effect bundling (FCD08). |
| **low** | 1.0 | Minor issue: sub-optimal component file organization or redundant wrapper element with negligible impact. |

---

## 2. Confidence and Uncertainty Handling

Confidence measures how strongly code evidence supports a finding:

| Confidence | Multiplier | Definition |
|---|---|---|
| **high** | 1.00 | Defect is directly visible in the diff with demonstrable coupling, untestability, or maintenance risk. |
| **medium** | 0.70 | Complex component design is visible, but broader application context or shared utility library is partially obscured. |
| **low** | 0.30 | Concern is subjective stylistic preference or theoretical maintainability suggestion without code evidence. |

**Low-confidence concerns must not be reported as findings.** Instead, record an `uncertainty_note` at the dimension level (0.0 score deduction).

---

## 3. Native 0–10 Score Calculation

Frontend component design scores are calculated directly on a **0.0 to 10.0 scale** from start to finish without any intermediate 0–100 calculation or division:

```
deduction = round(base_deduction × confidence_multiplier)
final_score = max(0.0, min(10.0, 10.0 - sum(deductions)))
```

- **Starting Score:** Initialized at `10.0`.
- **Deductions:** Applied directly on the 0–10 scale.
- **Precision:** Rounded to one decimal place (`X.X`) and clamped within `[0.0, 10.0]`.

### Deduplication and Documented Exceptions
- **Duplicate Findings:** Multiple symptoms stemming from a single god component produce **one primary finding** under the most specific applicable rule ID (FCD01–FCD10).
- **Approved Exceptions:** Documented prototype components or experimental spike components reduce deductions by **50%** with `status: "accepted"`.

---

## 4. Standard Scoring and Blocking Rubric

The component design review enforces the standard merge-blocking policy:

| Score | Status | Description & Blocking Rule |
|---|---|---|
| **10.0 (10/10)** | ✅ **Pass** | **Zero confirmed violations.** Highly cohesive, well-encapsulated, and testable frontend components. |
| **9.0 (9/10)** | ✅ **Pass with minor issues** | **At most one minor (low) non-blocking violation.** No medium, high, or critical component design defects. |
| **0.0 – 8.9** | ❌ **Merge Blocked** | **One or more medium, high, or critical violations confirmed.** Requires remediation before merge. |

---

## 5. Scorecard Aggregator Finding Format

```yaml
dimension: frontend_component_design
score: 6.0 # 10.0 - 4.0 (1 High violation)
findings:
  - id: "FCD01"
    title: "God component combines user auth, payment processing, and profile editing"
    severity: "high"
    confidence: "high"
    file: "src/components/AccountManager.tsx"
    line: 15
    line_range: [15, 85]
    description: "AccountManager component directly coordinates OAuth tokens, Stripe billing endpoints, avatar image uploads, and form validation in a single uncohesive file."
    evidence: "Component contains 12 disparate state hooks and 6 independent network effects for unrelated feature areas."
    remediation: "Split AccountManager into separate AuthSettings, BillingSettings, and ProfileSettings components."
```

