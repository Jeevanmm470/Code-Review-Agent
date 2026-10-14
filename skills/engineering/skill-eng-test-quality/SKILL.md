---
name: skill-eng-test-quality
description: >-
  Activate when reviewing code changes for test effectiveness, assertion substance, regression coverage,
  failure path verification, test isolation, mock fidelity, flakiness, determinism, integration boundaries,
  and contract testing across Python, Java, C#, Go, and TypeScript without demanding arbitrary coverage
  metrics or rigid test architectures.
---

# Engineering Test Quality Review Skill

## 1. Purpose & Activation

This skill evaluates pull requests and code modifications for defects in test effectiveness, assertion substance, behavioral and regression coverage, failure-path verification, test isolation, mock fidelity, determinism, and integration boundaries across unit, integration, contract, and end-to-end test suites.

**Activate when** code changes introduce new features, bug fixes, refactorings, or modify test files (e.g., `tests/`, `__tests__/`, `*Test.java`, `*Tests.cs`); or when review context cites assertion-free smoke tests, brittle mock-to-implementation coupling, flaky time-based assertions, missing regression tests for fixed defects, or shared state test pollution.

Do not report findings solely because coverage is below an arbitrary percentage, a test uses mocks, or a trivial change lacks a dedicated unit test when existing suite tests adequately exercise reachable code paths.

## 2. Technology Context

Infer the test runner and framework from repository dependencies and imports (e.g., pytest, JUnit 5, NUnit/xUnit, Jest/Vitest, Go testing). Apply test quality principles cross-language (Python, Java, C#, Go, TypeScript), evaluating tests against the actual risk, public behavioral contracts, and isolation requirements.

Refer to [`references/checklist.md`](references/checklist.md) for technology-specific detection patterns and examples.

Technology context guides how rules are applied; it is not a standalone review objective. Report only evidence-based test quality defects, not findings based solely on stylistic testing preferences.

## 3. Test Quality Rules

| ID | Rule | Objective |
|---|---|---|
| TST01 | Meaningful Assertions & Non-Trivial Checks | Ensure tests contain substantive assertions verifying domain outcomes rather than empty execution or tautologies. |
| TST02 | Behavioral & Bug Regression Coverage | Verify bug fixes and new business capabilities include targeted regression tests preventing reintroduction. |
| TST03 | Failure Path & Boundary Verification | Assert that invalid inputs, exceptions, timeouts, and partial failures produce expected errors and clean state. |
| TST04 | Test Isolation & State Cleanup | Prevent tests from depending on execution order, shared mutable singletons, or leaking persisted disk/DB state. |
| TST05 | Mock Fidelity & Over-Mocking Prevention | Prevent tautological mocks that mirror implementation details without testing business logic or real contracts. |
| TST06 | Deterministic Execution & Flakiness Elimination | Eliminate non-deterministic sleeps, uncontrolled clock dependencies, thread race conditions, and random seeds. |
| TST07 | Integration & Contract Boundary Verification | Verify that external boundaries (DB, HTTP APIs, serializers, provider adapters) have contract or integration tests. |
| TST08 | Test Fixture Clarity & Environment Hygiene | Ensure test fixtures and seed data are clean, isolated, self-describing, and free of hardcoded environment paths. |
| TST09 | Async & Concurrency Test Synchronization | Ensure asynchronous operations, background promises, and concurrent threads are properly awaited and joined. |
| TST10 | Risk-Proportionate Test Scoping | Ensure critical business logic and high-impact workflows have thorough multi-case tests matching operational risk. |

*Detailed criteria, evidence, and remediation per rule are defined in [`references/checklist.md`](references/checklist.md).*

## 4. Review Workflow

1. **Examine Changed Code & Test Diffs**: Trace modified business logic, bug fixes, or schema updates alongside associated test modifications.
2. **Evaluate Verification Gaps**: Determine whether tests prove the changed behavior, cover critical failure paths, and isolate state.
3. **Assess Assertion Substance & Mocks**: Inspect assertions for trivial checks (`assert True`, unverified exception bodies) and evaluate mock realism.
4. **Evaluate Evidence**: Consult [`references/checklist.md`](references/checklist.md) to substantiate findings with visible code patterns.
5. **Score & Deduplicate**: Apply [`references/scoring-guide.md`](references/scoring-guide.md). Consolidate multiple symptoms sharing a single root cause into one finding.
6. **Generate Output**: Format findings using the Scorecard Aggregator schema below.

## 5. Review Principles & False-Positive Safeguards

- **Evidence-Based**: Report test quality defects supported by concrete code evidence; demonstrate plausible false positives, silent regressions, or suite pollution.
- **Do Not Enforce Arbitrary Coverage Percentages**: Do not flag code solely for failing to hit a fixed 80% or 100% line coverage metric unless an explicit repository rule mandates it.
- **Valid Use of Mocks**: Do not flag mocks if they isolate expensive network calls, third-party payment gateways, or external clock dependencies accurately.
- **Integration vs Unit Balance**: Do not mandate full database integration tests for pure in-memory domain calculation functions.
- **Coordinated Fixtures**: Do not flag missing local cleanup if standard test runner hooks (`@pytest.fixture`, `@AfterEach`, `IAsyncLifetime`) manage teardown.
- **Root-Cause Deduplication**: Multiple weak assertions in a single test file should be aggregated into one primary finding under `TST01`.

## 6. Skill Boundaries & Delegation

- **Business Logic** ([`skill-eng-business-logic`](../skill-eng-business-logic/SKILL.md)): Core domain rules, calculations, and state machine validity.
- **Maintainability** ([`skill-eng-maintainability`](../skill-eng-maintainability/SKILL.md)): Code organization, readability, and structural simplicity.
- **Resource Lifecycle** ([`skill-eng-resource-lifecycle`](../skill-eng-resource-lifecycle/SKILL.md)): Production and system resource cleanup, RAII, and leak prevention.
- **Error Handling** ([`skill-eng-error-handling`](../skill-eng-error-handling/SKILL.md)): Application exception propagation and error hierarchies.
- **Backward Compatibility** ([`skill-eng-backward-compatibility`](../skill-eng-backward-compatibility/SKILL.md)): Public schema evolution and breaking API detection.
- **Security** ([`skill-eng-security`](../skill-eng-security/SKILL.md)): Security vulnerability detection and secret management.

## 7. Output Contract & References

Return structured output compatible with the Code Review Portal Scorecard Aggregator:

```json
{
  "dimension": "test_quality",
  "score": 8.0,
  "findings": [
    {
      "ruleId": "TST01",
      "title": "Assertion-Free Test Executing Logic Without Verification",
      "severity": "high",
      "confidence": "high",
      "file": "tests/test_order_processor.py",
      "lineStart": 18,
      "lineEnd": 25,
      "evidence": "test_process_order() invokes processor.process(order) but contains zero assert statements",
      "impact": "Test passes even if order processing corrupts state, calculates wrong totals, or fails silently",
      "recommendation": "Add assertions verifying order status, database persistence, and calculated financial totals",
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
| `ruleId` | string | Yes | TST01–TST10 stable identifier |
| `title` | string | Yes | Concise issue summary |
| `severity` | string | Yes | `critical`, `high`, `medium`, or `low` |
| `confidence` | string | Yes | `high`, `medium`, or `low` |
| `file` | string | Yes | Repository-relative path |
| `lineStart` | integer | Yes | First line number of the relevant code |
| `lineEnd` | integer | No | End line number of the relevant code block |
| `evidence` | string | Yes | Concrete code observation supporting the issue |
| `impact` | string | Yes | Plausible defect escape, regression risk, or test flakiness impact |
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

