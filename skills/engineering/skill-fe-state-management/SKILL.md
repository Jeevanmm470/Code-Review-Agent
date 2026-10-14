---
name: skill-fe-state-management
description: >-
  Activate when reviewing frontend code changes involving state ownership, stores, reducers, signals,
  derived state, async race conditions, stale closures, optimistic updates, cache invalidation, state persistence,
  or reactivity change detection across React, Angular, Vue, Svelte, Blazor, TypeScript, and JavaScript.
---

# Frontend State Management Engineering Review Skill

## 1. Purpose & Activation

This skill evaluates pull requests and code modifications for frontend state management defects, including conflicting sources of truth, stale derived calculations, asynchronous race conditions, impossible state combinations, unisolated global stores, failed optimistic rollbacks, corrupted persisted state, uncleaned subscriptions, stale closures, and change-detection bypasses across React, Angular, Vue, Svelte, Blazor, TypeScript, and JavaScript applications.

**Activate when** code changes introduce or modify state hooks (`useState`, `useReducer`), signals, stores (Redux, Pinia, Zustand, NgRx), reactive watchers (`useEffect`, `watch`, computed values), optimistic mutations, client-side caching, local/session state persistence, or inter-component data propagation; or when review context cites race conditions, out-of-order responses, flickering UI, stale state overwrites, or broken undo/redo workflows.

Do not report findings solely because code uses local component state rather than a global store, uses mutable reactive patterns where the framework expects them (e.g. Vue reactive proxies, Svelte runes), or maintains intentional local editing drafts separate from server models.

## 2. Technology Context

Infer the frontend framework, state library, and reactive paradigm from imports, package manifests, and component structures (e.g. React hooks/Zustand, Vue reactivity/Pinia, Angular signals/RxJS/NgRx, Svelte runes/stores, Blazor state containers). Apply state management correctness principles cross-technology, evaluating code against framework reactivity contracts, update batching, and data integrity guarantees.

Refer to [`references/checklist.md`](references/checklist.md) for paradigm-specific detection patterns and examples.

Technology context guides how rules are applied; it is not a standalone review objective. Report only evidence-based state defects, not findings based solely on architectural preference for a specific state library.

## 3. Frontend State Management Rules

| ID | Rule | Objective |
|---|---|---|
| FSM01 | State Ownership & Duplication Prevention | Eliminate competing sources of truth, unsynchronized prop mirroring, and uncoordinated state copies. |
| FSM02 | Derived State & Synchronized Computations | Ensure computed/derived values are calculated on-the-fly rather than cached in redundant state. |
| FSM03 | Async Race Conditions & Sequence Safety | Prevent out-of-order asynchronous responses from overwriting newer search, filter, or entity selections. |
| FSM04 | State Transitions & Invariant Integrity | Prevent contradictory states (e.g. simultaneous loading and error) and enforce valid state transitions. |
| FSM05 | Shared & Global State Store Isolation | Prevent unintended cross-component side effects and ensure proper tenant/user store isolation. |
| FSM06 | Cache Invalidation & Optimistic Rollbacks | Ensure failed optimistic mutations revert state cleanly and server caches use complete query keys. |
| FSM07 | Persistence Schema & State Restoration | Validate persisted state against current schema versions and purge sensitive session state on reset. |
| FSM08 | Lifecycle Subscriptions & Stale Closures | Prevent memory leaks and stale closure overwrites by cleaning up listeners and updating captured refs. |
| FSM09 | State Mutation & Change Detection Safety | Prevent in-place object/array mutations that bypass change detection or corrupt snapshot history. |
| FSM10 | Multi-Layer Data Flow & Boundary Contracts | Ensure state modifications across disjointed layers maintain domain invariants and validation rules. |

*Detailed criteria, evidence, and remediation per rule are defined in [`references/checklist.md`](references/checklist.md).*

## 4. Review Workflow

1. **Examine State Declarations**: Identify all local states, stores, derived computations, and persistence hooks in the diff.
2. **Trace Asynchronous Data Flow**: Follow async fetch/mutation triggers, verifying response ordering, sequence IDs, and cancellation guards.
3. **Verify State Transitions & Invariants**: Inspect boolean flag matrices and reducer action transitions for impossible contradictory states.
4. **Evaluate Evidence**: Consult [`references/checklist.md`](references/checklist.md) to substantiate findings with visible code patterns and plausible execution sequences.
5. **Score & Deduplicate**: Apply [`references/scoring-guide.md`](references/scoring-guide.md). Consolidate multiple symptoms sharing a single state defect into one finding.
6. **Generate Output**: Format findings using the Scorecard Aggregator schema below.

## 5. Review Principles & False-Positive Safeguards

- **Evidence-Based Exploitability**: Report state defects supported by concrete code evidence; demonstrate a specific sequence of actions producing stale or corrupt UI.
- **Valid Intentional Drafts**: Do not flag local component copies of props when used as independent form editing drafts before submit.
- **Framework Idiomatic Reactivity**: Do not flag direct property assignment in frameworks designed for fine-grained reactivity (Vue, MobX, Svelte) unless object aliasing or change detection breaks.
- **No Library Dogmatism**: Do not demand migration to Redux, Zustand, signals, or state machines when simple local state or context is sufficient and correct.
- **Cancellation vs Stale Guards**: Do not flag missing AbortController if response sequence identity checks or request tracking already prevent out-of-order writes.
- **Root-Cause Deduplication**: Multiple UI inconsistencies caused by a single desynchronized state copy should be consolidated into one finding under `FSM01`.

## 6. Skill Boundaries & Delegation

- **Frontend Security** ([`skill-fe-frontend-security`](../skill-fe-frontend-security/SKILL.md)): Storage of tokens, XSS in rendered state, and sensitive data leakage.
- **Resource Lifecycle** ([`skill-eng-resource-lifecycle`](../skill-eng-resource-lifecycle/SKILL.md)): General system handles, web workers, and DOM event listeners.
- **Error Handling** ([`skill-eng-error-handling`](../skill-eng-error-handling/SKILL.md)): Error boundaries, retry policies, and catch blocks.
- **Test Quality** ([`skill-eng-test-quality`](../skill-eng-test-quality/SKILL.md)): Testing component renders, mock stores, and state assertion substance.
- **Maintainability** ([`skill-eng-maintainability`](../skill-eng-maintainability/SKILL.md)): General code structure, naming, and component decomposition.

## 7. Output Contract & References

Return structured output compatible with the Code Review Portal Scorecard Aggregator:

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
      "file": "src/components/UserSearch.tsx",
      "lineStart": 18,
      "lineEnd": 28,
      "evidence": "fetchUsers(query) async response directly calls setUsers(res) without request sequence ID or AbortController",
      "impact": "Slow earlier search query resolves after faster later search query, displaying incorrect results for current input",
      "recommendation": "Use an active request token/counter or AbortController to discard responses from obsolete search requests",
      "technology": "React/TypeScript",
      "status": "open"
    }
  ],
  "uncertainty_notes": [],
  "blocked": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `ruleId` | string | Yes | FSM01–FSM10 stable identifier |
| `title` | string | Yes | Concise issue summary |
| `severity` | string | Yes | `critical`, `high`, `medium`, or `low` |
| `confidence` | string | Yes | `high`, `medium`, or `low` |
| `file` | string | Yes | Repository-relative path |
| `lineStart` | integer | Yes | First line number of the relevant code |
| `lineEnd` | integer | No | End line number of the relevant code block |
| `evidence` | string | Yes | Concrete code observation supporting the issue |
| `impact` | string | Yes | Stale data, UI freeze, race condition overwrite, or state corruption |
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

