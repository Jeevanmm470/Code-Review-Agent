---
name: skill-eng-resource-lifecycle
description: >-
  Activate when reviewing code changes for resource ownership, acquisition, cleanup, disposal,
  connection pools, file descriptors, synchronization primitives, subprocess lifecycles, background
  task cancellation, event subscriptions, and temporary artifacts across Python, Java, C#, Go,
  and TypeScript without enforcing redundant wrappers or premature disposal.
---

# Engineering Resource Lifecycle Review Skill

## 1. Purpose & Activation

This skill evaluates pull requests and code modifications for defects in resource ownership, acquisition, cleanup, scoped disposal, and leak prevention across system, network, concurrency, and persistent resource domains (e.g., database connections/transactions, file/stream handles, HTTP clients/sockets, locks/semaphores, background tasks/workers, subprocesses, temporary files/directories, and event/cancellation subscriptions).

**Activate when** code changes acquire, manage, hold, or dispose runtime resources (files, sockets, database connections, locks, threads, child processes, temp files, event listeners, cancellation tokens); or when review context cites file descriptor leaks, connection pool exhaustion, deadlock on unreleased locks, abandoned subprocesses, zombie tasks, or memory retention from unreleased listeners.

Do not report findings merely because a resource lacks explicit manual disposal when managed by dependency injection, framework scopes, or enclosing context managers.

## 2. Technology Context

Infer the target language and runtime environment from repository imports and dependencies (e.g., Python `with` / `contextlib`, Java `try-with-resources` / `AutoCloseable`, C# `using` / `IAsyncDisposable`, Go `defer` / `io.Closer`, TypeScript `using` / `AbortController`). Apply lifecycle principles cross-language, evaluating implementation correctness against the declared ownership contracts.

Refer to [`references/checklist.md`](references/checklist.md) for technology-specific detection patterns and examples.

Technology context guides how rules are applied; it is not a standalone review objective. Report only evidence-based lifecycle defects, not findings based solely on stylistic disposal preferences.

## 3. Resource Lifecycle Rules

| ID | Rule | Objective |
|---|---|---|
| RES01 | Deterministic Ownership & Disposal | Ensure every acquired resource has an unambiguous owner responsible for guaranteed deterministic cleanup. |
| RES02 | Exception-Safe Cleanup & Scope Guards | Guarantee resource release across all early returns, normal completions, and exceptional failure paths. |
| RES03 | Partial Initialization & Rollback | Ensure multi-resource initialization safely tears down already-acquired resources if subsequent setup fails. |
| RES04 | Async Scope & In-Flight Concurrency | Prevent disposing resources while asynchronous tasks or background promises are actively executing against them. |
| RES05 | Synchronization Primitive Release | Ensure locks, mutexes, and semaphores are released in `finally` / `defer` blocks to prevent deadlock. |
| RES06 | Connection Pool & Client Reuse | Prevent creating disposable clients in tight loops and ensure pooled connections return to the pool promptly. |
| RES07 | Subprocess & Worker Termination | Guarantee child processes, worker threads, and streams are drained, joined, or terminated on cancellation. |
| RES08 | Temporary File & Artifact Pruning | Ensure temporary files, directories, and scratch buffers are deleted on process completion or failure. |
| RES09 | Subscription, Timer & Listener Unregistration | Unsubscribe event handlers, dispose active timers, and cancel callbacks when parent components are destroyed. |
| RES10 | Resource Lifecycle Test Verification | Verify test suites test cleanup on exception paths, cancellation, and repeated execution without leaking state. |

*Detailed criteria, evidence, and remediation per rule are defined in [`references/checklist.md`](references/checklist.md).*

## 4. Review Workflow

1. **Identify Resource Lifetimes**: Review changed diffs, trace resource allocation from acquisition point through execution paths to disposal or return.
2. **Establish Failure Paths**: Determine what happens when exceptions throw midway, tasks cancel, loops terminate early, or parent objects tear down.
3. **Verify Ownership & Scope**: Confirm whether ownership is explicit, scoped to the correct boundary, and released via idioms (`try-with-resources`, `using`, `with`, `defer`).
4. **Evaluate Evidence**: Consult [`references/checklist.md`](references/checklist.md) to substantiate findings with visible code patterns.
5. **Score & Deduplicate**: Apply [`references/scoring-guide.md`](references/scoring-guide.md). Consolidate multiple symptoms sharing a single root cause into one finding.
6. **Generate Output**: Format findings using the Scorecard Aggregator schema below.

## 5. Review Principles & False-Positive Safeguards

- **Evidence-Based**: Report resource lifecycle defects supported by concrete code evidence; demonstrate plausible leaks, deadlocks, premature disposal, or exhaustion.
- **Framework & Container Lifecycles**: Do not flag missing manual `.close()` calls on dependencies managed by DI containers (e.g., Spring `@Bean`, ASP.NET Core scoped services).
- **Long-Lived Singletons & Shared Pools**: Do not flag persistent HTTP clients, DB connection pools, or logger singletons intended to live for the process duration.
- **Ownership Transfer**: Do not flag missing disposal in factory methods or constructors that explicitly transfer resource ownership to the caller.
- **Guaranteed Enclosing Contexts**: Do not report missing `finally` cleanup if an enclosing framework middleware, decorator, or context manager handles teardown.
- **Root-Cause Deduplication**: Multiple symptoms stemming from one underlying resource leak must produce one primary finding.

## 6. Skill Boundaries & Delegation

- **Data Access Patterns** ([`skill-eng-data-access-patterns`](../skill-eng-data-access-patterns/SKILL.md)): SQL query performance, N+1 loading, and ORM mapping correctness.
- **Async Delivery** ([`skill-eng-async-delivery`](../skill-eng-async-delivery/SKILL.md)): Message queue acknowledgements, outbox patterns, and consumer retry policies.
- **Error Handling** ([`skill-eng-error-handling`](../skill-eng-error-handling/SKILL.md)): Generic exception hierarchies, unhandled rejections, and process crashes.
- **Performance** ([`skill-eng-performance`](../skill-eng-performance/SKILL.md)): Computational complexity, memory allocation efficiency, and cache tuning.
- **Security** ([`skill-eng-security`](../skill-eng-security/SKILL.md)): Sensitive file permissions, secret sanitization, and cryptographic nonce lifecycles.
- **Cloud Integration** ([`skill-eng-cloud-integration`](../skill-eng-cloud-integration/SKILL.md)): Cloud identity authentication, IAM tokens, and cloud infrastructure lifecycles.

## 7. Output Contract & References

Return structured output compatible with the Code Review Portal Scorecard Aggregator:

```json
{
  "dimension": "resource_lifecycle",
  "score": 8.0,
  "findings": [
    {
      "ruleId": "RES01",
      "title": "Unclosed File Stream on Exception Path",
      "severity": "high",
      "confidence": "high",
      "file": "src/utils/file_parser.py",
      "lineStart": 42,
      "lineEnd": 48,
      "evidence": "open(file_path, 'r') is opened directly without 'with' statement or try/finally block",
      "impact": "File descriptor remains open indefinitely if parsing raises an exception, causing OS descriptor exhaustion",
      "recommendation": "Wrap file access in 'with open(...) as f:' context manager to guarantee deterministic closure",
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
| `ruleId` | string | Yes | RES01–RES10 stable identifier |
| `title` | string | Yes | Concise issue summary |
| `severity` | string | Yes | `critical`, `high`, `medium`, or `low` |
| `confidence` | string | Yes | `high`, `medium`, or `low` |
| `file` | string | Yes | Repository-relative path |
| `lineStart` | integer | Yes | First line number of the relevant code |
| `lineEnd` | integer | No | End line number of the relevant code block |
| `evidence` | string | Yes | Concrete code observation supporting the issue |
| `impact` | string | Yes | Plausible reliability, descriptor leak, or resource exhaustion impact |
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

