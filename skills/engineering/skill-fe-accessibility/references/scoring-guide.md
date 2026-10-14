# Frontend Accessibility Scoring Guide & Scorecard Aggregator Reference

This guide defines how findings from `SKILL.md` rules FA11Y01–FA11Y10 are classified and how the accessibility dimension score and merge-blocking decisions are calculated directly on a native **0.0–10.0 scale** for the Code Review Portal's Scorecard Aggregator.

---

## 1. Severity Classification & Base Deductions

Severity reflects the **demonstrated barrier impact** on keyboard-only users, screen-reader users, and people with visual or motor disabilities across rules FA11Y01–FA11Y10 (e.g. clickable non-interactive divs FA11Y01, missing accessible names/labels FA11Y02, keyboard traps/unreachable widgets FA11Y03, destroyed focus rings/unmanaged modals FA11Y04, broken ARIA state sync FA11Y05, unlinked form errors FA11Y06, color-only cues/contrast failures FA11Y07, missing alt text on informative images FA11Y08, silent dynamic status updates FA11Y09, and ignored reduced-motion/tiny touch targets FA11Y10).

| Severity | Base Deduction (0–10 Scale) | Definition & Accessibility Impact |
|---|---|---|
| **critical** | 6.0 | Severe barrier: keyboard trap preventing page exit (FA11Y03), modal dialog completely trapping focus in unreachable background DOM, or critical core workflow blocked for assistive technologies. Triggers unconditional merge block. |
| **high** | 4.0 | Major accessibility barrier: clickable div without keyboard support (FA11Y01), icon-only button missing accessible name (FA11Y02), global focus outline removal (FA11Y04), unlinked form error messages (FA11Y06), status conveyed solely by color (FA11Y07), or missing alt text on informative chart/image (FA11Y08). |
| **medium** | 2.0 | Moderate barrier: out-of-sync `aria-expanded` flag (FA11Y05), dynamic notification missing `aria-live` region (FA11Y09), or animation ignoring `prefers-reduced-motion` (FA11Y10). |
| **low** | 1.0 | Minor issue: redundant ARIA role on native element (e.g. `<button role="button">`) with no functional failure. |

---

## 2. Confidence and Uncertainty Handling

Confidence measures how strongly code evidence supports a finding:

| Confidence | Multiplier | Definition |
|---|---|---|
| **high** | 1.00 | Barrier is directly visible in the diff with demonstrable assistive technology or keyboard failure. |
| **medium** | 0.70 | Inaccessible markup pattern is visible, but surrounding layout styles or parent event delegation is partially obscured. |
| **low** | 0.30 | Concern is speculative contrast estimation without concrete color values, or unverified screen-reader behavior. |

**Low-confidence concerns must not be reported as findings.** Instead, record an `uncertainty_note` at the dimension level (0.0 score deduction).

---

## 3. Native 0–10 Score Calculation

Frontend accessibility scores are calculated directly on a **0.0 to 10.0 scale** from start to finish without any intermediate 0–100 calculation or division:

```
deduction = round(base_deduction × confidence_multiplier)
final_score = max(0.0, min(10.0, 10.0 - sum(deductions)))
```

- **Starting Score:** Initialized at `10.0`.
- **Deductions:** Applied directly on the 0–10 scale.
- **Precision:** Rounded to one decimal place (`X.X`) and clamped within `[0.0, 10.0]`.

### Deduplication and Documented Exceptions
- **Duplicate Findings:** Multiple missing accessible names in a single toolbar produce **one primary finding** under the most specific applicable rule ID (FA11Y01–FA11Y10).
- **Approved Exceptions:** Documented internal developer debug overlays or hidden test sandboxes reduce deductions by **50%** with `status: "accepted"`.

---

## 4. Standard Scoring and Blocking Rubric

The accessibility review enforces the standard merge-blocking policy:

| Score | Status | Description & Blocking Rule |
|---|---|---|
| **10.0 (10/10)** | ✅ **Pass** | **Zero confirmed violations.** Fully accessible, semantic, keyboard-operable, and screen-reader compliant. |
| **9.0 (9/10)** | ✅ **Pass with minor issues** | **At most one minor (low) non-blocking violation.** No medium, high, or critical accessibility barriers. |
| **0.0 – 8.9** | ❌ **Merge Blocked** | **One or more medium, high, or critical violations confirmed.** Requires remediation before merge. |

---

## 5. Scorecard Aggregator Finding Format

```yaml
dimension: frontend_accessibility
score: 6.0 # 10.0 - 4.0 (1 High violation)
findings:
  - id: "FA11Y01"
    title: "Clickable div button lacks keyboard support and role"
    severity: "high"
    confidence: "high"
    file: "src/components/DeleteButton.tsx"
    line: 12
    line_range: [12, 18]
    description: "Component uses a div with onClick to perform destructive deletion, omitting tabIndex, onKeyDown, and role=\"button\"."
    evidence: "<div onClick={handleDelete} className=\"btn-delete\">Delete Account</div>"
    remediation: "Use a native <button type=\"button\"> element to ensure keyboard focus and screen reader activation."
```

