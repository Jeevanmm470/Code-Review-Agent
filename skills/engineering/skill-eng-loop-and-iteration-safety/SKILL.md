---
name: skill-eng-loop-and-iteration-safety
description: >-
  Activate when reviewing code changes for loop termination, iteration bounds, collection mutation during
  traversal, pagination progression, recursive convergence, unbounded retries, async loop cancellation,
  in-loop resource accumulation, state transition convergence, and loop boundary test coverage across Python,
  Java, C#, Go, and TypeScript.
---

# Engineering Loop and Iteration Safety Review Skill

## 1. Purpose & Activation

This skill evaluates pull requests and code modifications for defects in loop termination guarantees, iteration bounds calculations, safe traversal over mutated collections, pagination and cursor progression, recursive base cases, retry/polling deadlines, asynchronous loop cancellation, in-loop memory and resource accumulation, state transition convergence, and boundary test verification across application logic, batch processing, background workers, and iterative agent workflows.

**Activate when** code changes introduce or modify `while`, `for`, `do-while` loops, recursive algorithms, pagination cursor traversals, polling/retry loops, stream/batch processors, asynchronous worker iteration, or state convergence loops; or when review context cites hanging workers, CPU spinning, infinite pagination loops, off-by-one index exceptions, `ConcurrentModificationException` / `RuntimeError: dictionary changed size during iteration`, or unbounded memory growth inside loops.

Do not report findings solely because code uses recursion, loops over large datasets, or uses standard pagination when monotonic progression and termination conditions are provably guaranteed.

## 2. Technology Context

Infer the language and iteration paradigms from file extensions and imports (e.g., Python generators/iterators, Java streams/Iterators, C# `IEnumerable`/`IAsyncEnumerable`, Go range/channel loops, TypeScript `for...of`/async generators). Apply iteration safety principles cross-language (Python, Java, C#, Go, TypeScript), evaluating loops against termination invariants, resource containment, and boundary constraints.

Refer to [`references/checklist.md`](references/checklist.md) for technology-specific detection patterns and examples.

Technology context guides how rules are applied; it is not a standalone review objective. Report only evidence-based loop and iteration safety defects, not findings based solely on stylistic loop constructs.

## 3. Loop & Iteration Safety Rules

| ID | Rule | Objective |
|---|---|---|
| LPS01 | Guaranteed Loop Termination & Progress Invariants | Ensure every loop has a deterministic termination condition and monotonically advancing progress state. |
| LPS02 | Off-by-One & Boundary Condition Safety | Prevent index out-of-bounds, missed boundary items, and incorrect fencepost calculations on collections. |
| LPS03 | Safe Iteration Over Mutated Collections | Prevent concurrent modification and skipped elements when modifying collections during iteration. |
| LPS04 | Pagination & Cursor Traversal Progression | Guarantee cursor and token advancement, cycle detection, and empty-page exit in paginated queries. |
| LPS05 | Recursive Convergence & Base Case Verification | Ensure recursive calls progress toward explicit base cases with recursion depth guards preventing stack overflow. |
| LPS06 | Bounded Retries & Polling Deadlines | Enforce maximum attempt counts, backoff, and overall deadlines on polling and retry loops. |
| LPS07 | Async Loop Cancellation & Shutdown Propagation | Ensure asynchronous and worker loops respond promptly to cancellation tokens, signals, and shutdown events. |
| LPS08 | In-Loop Resource & Buffer Containment | Prevent unbounded memory accumulation, unclosed file/network handles, and memory leaks inside loop bodies. |
| LPS09 | State Convergence & Invariant Protection | Guarantee state machine and convergence loops terminate without infinite cycling or oscillation. |
| LPS10 | Boundary & Edge Condition Test Verification | Verify test suites adequately exercise empty, singleton, boundary, error, and maximum iteration limits. |

*Detailed criteria, evidence, and remediation per rule are defined in [`references/checklist.md`](references/checklist.md).*

## 4. Review Workflow

1. **Examine Changed Code**: Identify all loop constructs, recursion, pagination iterators, polling workers, and collection transformations in the diff.
2. **Trace Progress & Termination**: Verify that every iteration step modifies loop variables monotonically toward an explicit termination condition.
3. **Inspect Mutation & Resource Invariants**: Check whether collections are modified during iteration and ensure resource allocations within loop bodies are scoped or closed.
4. **Evaluate Evidence**: Consult [`references/checklist.md`](references/checklist.md) to substantiate findings with visible code patterns.
5. **Score & Deduplicate**: Apply [`references/scoring-guide.md`](references/scoring-guide.md). Consolidate multiple symptoms sharing a single loop bug into one finding.
6. **Generate Output**: Format findings using the Scorecard Aggregator schema below.

## 5. Review Principles & False-Positive Safeguards

- **Evidence-Based**: Report iteration defects supported by concrete code evidence; demonstrate plausible infinite loops, index errors, or memory leaks.
- **Do Not Enforce Arbitrary Iteration Styles**: Do not flag standard `while` or `for` loops merely because functional constructs (`map`, `filter`, LINQ, streams) could be used instead.
- **Valid Intentional Infinite Loops**: Long-running service daemons (e.g. `while not shutdown_event.is_set():`) are valid when shutdown signals and sleep/poll intervals are present.
- **Immutable/Copy Mutation**: Do not flag collection modification if iteration occurs over a defensive copy or snapshot (e.g., `list(d.keys())`, `new ArrayList<>(list)`).
- **Proper Pagination Guards**: Do not flag pagination loops that check both token presence and non-empty batch size.
- **Root-Cause Deduplication**: Multiple boundary errors within a single algorithm should be aggregated into one primary finding under `LPS02`.

## 6. Skill Boundaries & Delegation

- **Performance** ([`skill-eng-performance`](../skill-eng-performance/SKILL.md)): Algorithmic complexity ($O(N^2)$), query N+1, and batch sizing efficiency.
- **Resource Lifecycle** ([`skill-eng-resource-lifecycle`](../skill-eng-resource-lifecycle/SKILL.md)): Production RAII, connection pool cleanup, and handle lifecycle management.
- **Async Delivery** ([`skill-eng-async-delivery`](../skill-eng-async-delivery/SKILL.md)): Message acknowledgement, dead-lettering, and worker queue consumption semantics.
- **Test Quality** ([`skill-eng-test-quality`](../skill-eng-test-quality/SKILL.md)): General test assertion substance, flakiness, and mock fidelity.
- **Business Logic** ([`skill-eng-business-logic`](../skill-eng-business-logic/SKILL.md)): Domain rules, financial rounding, and business invariants.
- **Agentic Loop Patterns** ([`skill-agentic-loop-patterns`](../../agentic/skill-agentic-loop-patterns/SKILL.md)): Agent reflection, planning cycles, and LLM orchestration loops.

## 7. Output Contract & References

Return structured output compatible with the Code Review Portal Scorecard Aggregator:

```json
{
  "dimension": "loop_iteration_safety",
  "score": 6.0,
  "findings": [
    {
      "ruleId": "LPS01",
      "title": "Unadvancing Loop Index Causing Infinite Execution",
      "severity": "critical",
      "confidence": "high",
      "file": "src/processor.py",
      "lineStart": 42,
      "lineEnd": 55,
      "evidence": "while index < len(items): loop never increments index when condition is met",
      "impact": "Worker thread hangs indefinitely consuming 100% CPU and blocking job queue processing",
      "recommendation": "Ensure index += 1 is executed on all code paths or refactor to bounded for-in iteration",
      "technology": "Python",
      "status": "open"
    }
  ],
  "uncertainty_notes": [],
  "blocked": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `ruleId` | string | Yes | LPS01–LPS10 stable identifier |
| `title` | string | Yes | Concise issue summary |
| `severity` | string | Yes | `critical`, `high`, `medium`, or `low` |
| `confidence` | string | Yes | `high`, `medium`, or `low` |
| `file` | string | Yes | Repository-relative path |
| `lineStart` | integer | Yes | First line number of the relevant code |
| `lineEnd` | integer | No | End line number of the relevant code block |
| `evidence` | string | Yes | Concrete code observation supporting the issue |
| `impact` | string | Yes | Infinite hang, CPU spike, crash, data corruption, or memory leak |
| `recommendation` | string | Yes | Actionable remediation preserving valid behavior |
| `technology` | string | No | Inferred technology stack |
| `status` | string | No | Finding lifecycle status (default: `open`) |

Integration rules for the aggregator:
- `score` is calculated directly on a native 0.0–10.0 scale from start to finish without any intermediate 0–100 calculation or division, according to [`references/scoring-guide.md`](references/scoring-guide.md).
- `blocked` is set to `true` when the dimension score is below 9.0 (9/10) or when any confirmed critical violation is present.
- A score of 10.0 (10/10) indicates pass with zero violations; 9.0 (9/10) indicates pass with at most one minor non-blocking finding and no critical violations.
- Low-confidence observations must be recorded in `uncertainty_notes` and incur 0 deductions.

## 8. Supporting References

- **Inspection Checklist**: [`references/checklist.md`](references/checklist.md) — Detailed criteria, evidence, and remediation per rule.
- **Scoring Guide**: [`references/scoring-guide.md`](references/scoring-guide.md) — Severity tiers, deduction formulas, exceptions, and merge blocking.
- **Validation Suite**: [`validation/test-suite.json`](validation/test-suite.json) — Automated test cases for detection and false-positive verification.

