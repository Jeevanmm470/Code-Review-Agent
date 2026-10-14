# Loop and Iteration Safety Scoring Guide & Scorecard Aggregator Reference

This guide defines how findings from `SKILL.md` rules LPS01–LPS10 are classified and how the loop and iteration safety dimension score and merge-blocking decisions are calculated directly on a native **0.0–10.0 scale** for the Code Review Portal's Scorecard Aggregator.

---

## 1. Severity Classification & Base Deductions

Severity reflects the **demonstrated impact** of loop and iteration defects on application hanging, infinite loops, index crashes, concurrent modification errors, unprogressing pagination, or unbounded memory accumulation across rules LPS01–LPS10 (e.g. non-advancing loop condition LPS01, off-by-one boundary index LPS02, collection mutation during iteration LPS03, pagination cycle or unadvancing token LPS04, recursive divergence without base case LPS05, unbounded retry/polling loop LPS06, unhandled async cancellation in loop LPS07, in-loop resource/memory accumulation LPS08, oscillating state transitions LPS09, and missing loop boundary tests LPS10).

| Severity | Base Deduction (0–10 Scale) | Definition & Operational Impact |
|---|---|---|
| **critical** | 6.0 | Severe defect: infinite loop without progress (LPS01), unbounded recursion causing stack overflow crash (LPS05), or CPU freeze. Triggers unconditional merge block. |
| **high** | 4.0 | Major reliability defect: off-by-one index crash (LPS02), concurrent modification runtime error (LPS03), infinite pagination network cycle (LPS04), unbounded polling without deadline (LPS06), uncancelled async loop hanging on shutdown (LPS07), or in-loop resource leak (LPS08). |
| **medium** | 2.0 | Moderate defect: oscillating state machine without cycle detection (LPS09), or missing boundary/empty collection test coverage for complex iteration (LPS10). |
| **low** | 1.0 | Minor issue: non-idiomatic iteration construct with negligible performance impact. |

---

## 2. Confidence and Uncertainty Handling

Confidence measures how strongly code evidence supports a finding:

| Confidence | Multiplier | Definition |
|---|---|---|
| **high** | 1.00 | Finding is directly visible in the diff with unambiguous evidence of non-advancing loop, missing base case, or index error. |
| **medium** | 0.70 | Loop pattern poses potential divergence or leak, but runtime data bounds or external termination mechanisms are partially obscured. |
| **low** | 0.30 | Concern is speculative or assumes unreachable loop inputs without clear evidence. |

**Low-confidence concerns must not be reported as findings.** Instead, record an `uncertainty_note` at the dimension level (0.0 score deduction).

---

## 3. Native 0–10 Score Calculation

Loop and iteration safety scores are calculated directly on a **0.0 to 10.0 scale** from start to finish without any intermediate 0–100 calculation or division:

```
deduction = round(base_deduction × confidence_multiplier)
final_score = max(0.0, min(10.0, 10.0 - sum(deductions)))
```

- **Starting Score:** Initialized at `10.0`.
- **Deductions:** Applied directly on the 0–10 scale.
- **Precision:** Rounded to one decimal place (`X.X`) and clamped within `[0.0, 10.0]`.

### Deduplication and Documented Exceptions
- **Duplicate Findings:** Multiple loop boundary errors in a single function produce **one primary finding** under the most specific applicable rule ID (LPS01–LPS10).
- **Approved Exceptions:** Documented prototype scripts or legacy migration loops reduce deductions by **50%** with `status: "accepted"`.

---

## 4. Standard Scoring and Blocking Rubric

The loop and iteration safety review enforces the standard merge-blocking policy:

| Score | Status | Description & Blocking Rule |
|---|---|---|
| **10.0 (10/10)** | ✅ **Pass** | **Zero confirmed violations.** All loops guaranteed to terminate with bounded resource usage. |
| **9.0 (9/10)** | ✅ **Pass with minor issues** | **At most one minor (low) non-blocking violation.** No medium, high, or critical iteration risks. |
| **< 9.0 (< 9/10)** | ❌ **Rejected / Blocked** | **Merge blocked.** Any critical violation or cumulative high/medium violations reducing score below 9.0. |

---

## 5. Scorecard Output Example

```json
{
  "dimension": "loop_iteration_safety",
  "score": 4.0,
  "findings": [
    {
      "ruleId": "LPS01",
      "title": "Non-Advancing Loop Condition Causing Infinite Worker Hang",
      "severity": "critical",
      "confidence": "high",
      "file": "src/worker.py",
      "lineStart": 22,
      "lineEnd": 34,
      "evidence": "while offset < total_records: loop omits offset += batch_size when batch has uncommitted items",
      "impact": "Worker hangs indefinitely in tight CPU loop, consuming resources and freezing queue processing",
      "recommendation": "Advance offset unconditionally or refactor into bounded batch generator",
      "technology": "Python",
      "status": "open"
    }
  ],
  "uncertainty_notes": [],
  "blocked": true
}
```

