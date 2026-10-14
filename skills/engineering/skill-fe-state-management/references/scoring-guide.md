# Frontend State Management Scoring Guide & Scorecard Aggregator Reference

This guide defines how findings from `SKILL.md` rules FSM01–FSM10 are classified and how the state management dimension score and merge-blocking decisions are calculated directly on a native **0.0–10.0 scale** for the Code Review Portal's Scorecard Aggregator.

---

## 1. Severity Classification & Base Deductions

Severity reflects the **demonstrated operational impact** of frontend state management defects on data integrity, user experience, UI freezing, race condition overwrites, or broken state transitions across rules FSM01–FSM10 (e.g. unsynchronized state copies FSM01, stale derived calculations FSM02, async race conditions FSM03, contradictory state combinations FSM04, unisolated global stores FSM05, failed optimistic rollbacks FSM06, corrupted persisted state FSM07, uncleaned subscriptions / stale closures FSM08, change detection bypass via direct mutation FSM09, and multi-layer invariant violations FSM10).

| Severity | Base Deduction (0–10 Scale) | Definition & Operational Impact |
|---|---|---|
| **critical** | 6.0 | Severe defect: catastrophic state corruption, data leakage across users in SSR shared stores (FSM05), or application crash preventing critical user workflows. Triggers unconditional merge block. |
| **high** | 4.0 | Major reliability defect: asynchronous race conditions overwriting newer user selections (FSM03), unsynchronized duplicate state diverging from parent (FSM01), missing optimistic rollback leaving phantom UI data (FSM06), uncleaned subscriptions leaking memory / duplicate triggers (FSM08), or in-place mutations breaking reactivity (FSM09). |
| **medium** | 2.0 | Moderate defect: redundant derived state creating 1-render lag (FSM02), contradictory boolean flags (FSM04), unversioned local storage restoration (FSM07), or multi-layer validation bypass (FSM10). |
| **low** | 1.0 | Minor issue: non-idiomatic local state pattern with negligible performance impact. |

---

## 2. Confidence and Uncertainty Handling

Confidence measures how strongly code evidence supports a finding:

| Confidence | Multiplier | Definition |
|---|---|---|
| **high** | 1.00 | Defect is directly visible in the diff with verifiable execution sequence demonstrating stale or corrupt state. |
| **medium** | 0.70 | Insecure or race-prone pattern is visible, but surrounding component tree or caching middleware context is partially obscured. |
| **low** | 0.30 | Concern is speculative or assumes unverified concurrent user actions without code evidence. |

**Low-confidence concerns must not be reported as findings.** Instead, record an `uncertainty_note` at the dimension level (0.0 score deduction).

---

## 3. Native 0–10 Score Calculation

Frontend state management scores are calculated directly on a **0.0 to 10.0 scale** from start to finish without any intermediate 0–100 calculation or division:

```
deduction = round(base_deduction × confidence_multiplier)
final_score = max(0.0, min(10.0, 10.0 - sum(deductions)))
```

- **Starting Score:** Initialized at `10.0`.
- **Deductions:** Applied directly on the 0–10 scale.
- **Precision:** Rounded to one decimal place (`X.X`) and clamped within `[0.0, 10.0]`.

### Deduplication and Documented Exceptions
- **Duplicate Findings:** Multiple race conditions in a single search component produce **one primary finding** under the most specific applicable rule ID (FSM01–FSM10).
- **Approved Exceptions:** Documented prototype components or experimental sandboxes reduce deductions by **50%** with `status: "accepted"`.

---

## 4. Standard Scoring and Blocking Rubric

The state management review enforces the standard merge-blocking policy:

| Score | Status | Description & Blocking Rule |
|---|---|---|
| **10.0 (10/10)** | ✅ **Pass** | **Zero confirmed violations.** Predictable, atomic, and synchronized frontend state transitions. |
| **9.0 (9/10)** | ✅ **Pass with minor issues** | **At most one minor (low) non-blocking violation.** No medium, high, or critical state defects. |
| **< 9.0 (< 9/10)** | ❌ **Rejected / Blocked** | **Merge blocked.** Any critical violation or cumulative high/medium violations reducing score below 9.0. |

---

## 5. Scorecard Output Example

```json
{
  "dimension": "state_management",
  "score": 6.0,
  "findings": [
    {
      "ruleId": "FSM03",
      "title": "Asynchronous Search Race Condition Overwriting Newer Results",
      "severity": "high",
      "confidence": "high",
      "file": "src/components/SearchBox.tsx",
      "lineStart": 16,
      "lineEnd": 25,
      "evidence": "api.search(query).then(setResults) does not verify if query matches current active input",
      "impact": "Slow earlier search query resolves after faster later search query, displaying stale results for current input",
      "recommendation": "Track request sequence token or use AbortController to discard obsolete query responses",
      "technology": "React/TypeScript",
      "status": "open"
    }
  ],
  "uncertainty_notes": [],
  "blocked": true
}
```

