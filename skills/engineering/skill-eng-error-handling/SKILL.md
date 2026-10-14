---
name: skill-eng-error-handling
description: >-
  Activate when reviewing code changes for error and exception handling, failure propagation,
  recovery mechanisms, retry policies, asynchronous failure handling, transactional rollback consistency,
  and error boundary integrity across Python, Java, .NET/C#, JavaScript/TypeScript, Go, and AI-agent workflows.
  Evaluates correctness of failure states, exception contracts, and diagnostic preservation without enforcing
  subjective style preferences.
---

# Engineering Error Handling Review Skill

## 1. Purpose & Activation

This skill evaluates pull requests and code modifications for defects in error and exception handling, failure propagation, recovery mechanisms, retry safety, and transactional consistency across backend services, frontend applications, distributed pipelines, and AI-agent workflows.

**Activate when** code changes modify `try/catch/except` blocks, error status mappings, retry policies, async error handling, fallback logic, transactional rollbacks, compensation handlers, or error boundaries; or when review context cites silent failures, swallowed exceptions, data corruption on error, unhandled promise rejections, or leaky error responses.

Do not report findings merely because code catches broad exceptions at genuine system boundaries, uses documented safe fallbacks, or delegates error handling to enclosing middleware or framework infrastructure.

## 2. Technology Context

Infer the relevant technology from the supplied code and repository context. Apply cross-language error-handling principles across supported languages (Python, Java, C#, TypeScript/JavaScript, Go) and frameworks, adapting review criteria to language-specific semantics (e.g. checked vs unchecked exceptions, async task exceptions, error values vs exceptions).

Refer to [`references/checklist.md`](references/checklist.md) for technology-specific detection patterns and examples.

Technology context guides how rules are applied; it is not a standalone review objective. Report only evidence-based error handling defects, not findings based solely on language idioms.

## 3. Error Handling Rules

| ID | Rule | Objective |
|---|---|---|
| ERR01 | Error and Exception Suppression | Identify silently swallowed errors and failures masked as success without safe recovery. |
| ERR02 | Overly Broad Exception Handling | Identify generic catch-alls (`catch (Exception)`, `except Exception:`) that mask unrelated bugs. |
| ERR03 | Destructive Rethrow and Loss of Context | Identify rethrows that discard root causes, stack traces, or change exception types unexpectedly. |
| ERR04 | Error Classification and Contract Mapping | Ensure internal errors map accurately to domain, HTTP/RPC, or message-processing status contracts. |
| ERR05 | Sensitive Data Leakage in Error Responses | Prevent exposing internal stack traces, database schemas, or credentials in public error payloads. |
| ERR06 | Unsafe Fallback and Partial Recovery | Identify fallbacks that return invalid/stale defaults or report partial work as complete success. |
| ERR07 | Retry Safety and Termination | Prevent unbounded retries, retrying permanent client errors, and non-idempotent retry side effects. |
| ERR08 | Asynchronous and Concurrent Failure Propagation | Ensure errors in async tasks, promises, threads, and background workers are observed and handled. |
| ERR09 | Transactional Rollback and State Consistency | Ensure exceptions trigger database transaction rollbacks and complete state cleanup. |
| ERR10 | Error Boundary Integrity and State Safety | Prevent missing boundary handlers, redundant multi-layer handling, and invalid operational states. |

*Detailed criteria, evidence, and remediation per rule are defined in [`references/checklist.md`](references/checklist.md).*

## 4. Review Workflow

1. **Trace Failure Paths**: Review changed diffs, trace execution flow through callers and callees when errors occur.
2. **Establish Consequences**: Determine what happens after the error: propagation, fallback, retry, rollback, cancellation, or process exit.
3. **Verify Contract & Boundaries**: Confirm whether the behavior violates explicit contracts, data invariants, or boundary expectations.
4. **Evaluate Evidence**: Consult [`references/checklist.md`](references/checklist.md) to substantiate findings with visible code patterns.
5. **Score & Deduplicate**: Apply [`references/scoring-guide.md`](references/scoring-guide.md). Consolidate multiple symptoms sharing a single root cause into one finding.
6. **Generate Output**: Format findings using the Scorecard Aggregator schema below.

## 5. Review Principles & False-Positive Safeguards

- **Evidence-Based**: Report error handling defects supported by concrete code evidence; demonstrate plausible operational failure, data inconsistency, or masked bugs.
- **Intentional Fallbacks Are Safe**: Do not flag empty catches or default values when they represent documented, safe, and deliberate business fallbacks.
- **Top-Level Boundaries Are Valid**: Broad exception catches at process, HTTP controller, RPC handler, or queue consumer boundaries are standard practices to prevent process crashes.
- **Framework Delegation**: Do not demand local `try/catch` blocks when an existing global exception handler, filter, or middleware manages the error cleanly.
- **No Log-at-Every-Layer**: Do not recommend catching, logging, and rethrowing at every intermediate layer (causes log noise and redundant stack traces).
- **Distinguish Ephemeral vs Permanent**: Differentiate transient network faults from permanent input validation errors before asserting retry defects.
- **Root-Cause Deduplication**: Multiple symptoms stemming from one underlying error-handling defect must produce one primary finding.

## 6. Skill Boundaries & Delegation

- **Observability** ([`skill-eng-observability`](../../engineering/skill-eng-observability/SKILL.md) / Gate1): Log format, distributed tracing, correlation IDs, and telemetry.
- **Security** ([`skill-eng-security`](../skill-eng-security/SKILL.md)): OWASP vulnerabilities, authorization enforcement, and security-specific risk scoring.
- **Maintainability** ([`skill-eng-maintainability`](../skill-eng-maintainability/SKILL.md)): Code complexity, naming, method length, and structural cleanliness.
- **Performance** ([`skill-eng-performance`](../skill-eng-performance/SKILL.md)): Timeout durations, connection pool saturation, and resource allocation.
- **Business Logic** ([`skill-eng-business-logic`](../skill-eng-business-logic/SKILL.md)): Domain rule calculation and business specification adherence.

## 7. Output Contract & References

Return structured output compatible with the Code Review Portal Scorecard Aggregator:

```json
{
  "dimension": "error_handling",
  "score": 8.0,
  "findings": [
    {
      "ruleId": "ERR01",
      "title": "Silently Swallowed Payment Processing Exception",
      "severity": "high",
      "confidence": "high",
      "file": "src/services/payment_service.py",
      "lineStart": 54,
      "lineEnd": 62,
      "evidence": "except PaymentGatewayError: pass causes failed payments to return HTTP 200 OK",
      "impact": "Failed transactions are recorded as successful, causing uncollected revenue and state drift",
      "recommendation": "Propagate PaymentProcessingException or return explicit failure result with status code",
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
| `ruleId` | string | Yes | ERR01–ERR10 stable identifier |
| `title` | string | Yes | Concise issue summary |
| `severity` | string | Yes | `critical`, `high`, `medium`, or `low` |
| `confidence` | string | Yes | `high`, `medium`, or `low` |
| `file` | string | Yes | Repository-relative path |
| `lineStart` | integer | Yes | First line number of the relevant code |
| `lineEnd` | integer | No | End line number of the relevant code block |
| `evidence` | string | Yes | Concrete code observation supporting the issue |
| `impact` | string | Yes | Plausible reliability, correctness, or data impact |
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

