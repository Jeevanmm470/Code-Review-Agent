---
name: skill-fe-api-integration
description: >-
  Activate when reviewing frontend code changes involving HTTP clients, fetch/Axios requests, REST/GraphQL endpoints,
  request serialization, response parsing, async race conditions, token refresh, mutation consistency, or API lifecycle
  across React, Angular, Vue, Svelte, Blazor, TypeScript, and JavaScript.
---

# Frontend API Integration Engineering Review Skill

## 1. Purpose & Activation

This skill evaluates pull requests and code modifications for frontend-to-backend API integration defects, including malformed requests, serialization/contract mismatches, unhandled response status codes, asynchronous race conditions, token refresh deadlocks, optimistic mutation inconsistencies, pagination bugs, request lifecycle leaks, and client interceptor side effects across React, Angular, Vue, Svelte, Blazor, TypeScript, and JavaScript applications.

**Activate when** code changes introduce or modify HTTP clients (`fetch`, Axios, Angular `HttpClient`, Vue Apollo, trpc), API service layers, data-fetching hooks/stores, request/response DTOs, endpoint serializers, query parameter encoders, authentication interceptors, retry policies, pagination controllers, or mutation handlers; or when review context cites broken API contracts, stale search results, duplicate mutations, or unhandled 4xx/5xx network errors.

Do not report findings solely because code uses a specific HTTP client library (e.g. `fetch` vs `axios`), structures API URLs differently from a preferred convention, or lacks speculative caching/retries where simple direct requests are correct and reliable.

## 2. Technology Context

Infer the frontend framework, networking client, and contract mechanisms from imports, package manifests, and service layer structures (e.g. TypeScript interfaces, OpenAPI generated clients, Axios interceptors, Angular `HttpInterceptorFn`, TanStack Query mutations, SWR fetchers, RTK Query endpoints). Apply cross-language HTTP semantics and contract integrity standards, validating code against server expectations and browser networking constraints.

Refer to [`references/checklist.md`](references/checklist.md) for paradigm-specific detection patterns and examples.

Technology context guides how rules are applied; it is not a standalone review objective. Report only evidence-based API defects supported by concrete request/response code paths.

## 3. Frontend API Integration Rules

| ID | Rule | Objective |
|---|---|---|
| FAI01 | Request Construction & HTTP Semantics | Prevent malformed URLs, improper methods, unencoded query parameters, and invalid payload formats. |
| FAI02 | Contract Compatibility & Type Mapping | Eliminate schema mismatches, missing required fields, unvalidated response shapes, and silent data loss. |
| FAI03 | Async Race Conditions & Sequence Safety | Prevent out-of-order network responses from overwriting newer search, filter, or entity selections. |
| FAI04 | HTTP Status & Response Error Handling | Ensure non-2xx statuses, empty bodies, validation errors, and network failures are handled without false successes. |
| FAI05 | Auth Boundaries & Token Lifecycle | Prevent unauthenticated requests, token-refresh race conditions, infinite 401 loops, and header leakage. |
| FAI06 | Mutation Semantics & Data Consistency | Prevent duplicate non-idempotent submissions, stale overwrites, and unreconciled server rejection states. |
| FAI07 | Pagination, Filtering & Large Responses | Ensure cursors/offsets, filters, and termination conditions are preserved without record duplication or infinite loops. |
| FAI08 | Request Lifecycle & Abort Cleanup | Prevent unmounted/obsolete components from executing callbacks and leaking subscriptions or abort controllers. |
| FAI09 | Cache Invalidation & Query Consistency | Ensure cache keys capture all query parameters and mutation handlers invalidate or update affected cached queries. |
| FAI10 | Interceptors & Shared Client Isolation | Prevent global interceptors from mutating shared headers/payloads inappropriately or dropping retry context. |

*Detailed criteria, evidence, and remediation per rule are defined in [`references/checklist.md`](references/checklist.md).*

## 4. Review Workflow

1. **Trace Request Construction**: Identify the initiating action/hook, verify endpoint paths, query parameter encoding, HTTP verbs, and headers.
2. **Inspect Contract & Serialization**: Compare request payload and response parsing against TypeScript types, OpenAPI specs, or backend DTOs.
3. **Trace Async Flow & Concurrency**: Check for request sequence guards, `AbortController` signal forwarding, and out-of-order response handling.
4. **Evaluate Auth & Error Paths**: Inspect 401/403 refresh loops, non-2xx status handling, and empty body parsing (`response.json()` on 204).
5. **Score & Deduplicate**: Apply [`references/scoring-guide.md`](references/scoring-guide.md). Consolidate multiple symptoms sharing a single API integration root cause.
6. **Generate Output**: Format findings using the Scorecard Aggregator schema below.

## 5. Review Principles & False-Positive Safeguards

- **Evidence-Based Exploitability**: Report API defects supported by concrete code evidence; demonstrate a specific request sequence or payload mismatch causing runtime failure.
- **Contract Verification Before Reporting**: Do not guess backend requirements from field names alone; verify available DTOs, schemas, or call sites.
- **Shared Error Abstractions**: Do not flag missing local try/catch blocks if a centralized client interceptor or query error boundary handles failures.
- **No Universal Caching/Retries**: Do not demand retries, caching, or optimistic updates where standard direct request-response is sufficient.
- **204 / Empty Body Awareness**: Do not flag missing JSON response handling for endpoints returning `204 No Content` or `HEAD` requests.
- **Root-Cause Deduplication**: Multiple UI inconsistencies caused by a single malformed query parameter should be consolidated under `FAI01`.

## 6. Skill Boundaries & Coordination

- **Frontend Security** ([`skill-fe-frontend-security`](../skill-fe-frontend-security/SKILL.md)): Cross-site scripting (XSS), credential exposure in client builds, and CSRF token propagation.
- **Frontend State Management** ([`skill-fe-state-management`](../skill-fe-state-management/SKILL.md)): Component store reactivity, local caching stores, and UI derived computations.
- **Resource Lifecycle** ([`skill-eng-resource-lifecycle`](../skill-eng-resource-lifecycle/SKILL.md)): Generic timer disposals, worker lifecycles, and native event listeners.
- **Error Handling** ([`skill-eng-error-handling`](../skill-eng-error-handling/SKILL.md)): Generic error hierarchies, UI fallback boundaries, and non-HTTP exceptions.
- **Async Delivery** ([`skill-eng-async-delivery`](../skill-eng-async-delivery/SKILL.md)): Backend queue consumers, message brokers, and background worker queues.
- **RPC / API Design** ([`skill-be-rpc-api-design`](../skill-be-rpc-api-design/SKILL.md)): Server-side API contract definition, endpoint routing, and schema authorship.

## 7. Output Contract & References

Return structured output compatible with the Code Review Portal Scorecard Aggregator:

```json
{
  "dimension": "frontend_api_integration",
  "score": 6.0,
  "findings": [
    {
      "ruleId": "FAI03",
      "title": "Uncontrolled async search allows out-of-order response overwrites",
      "severity": "high",
      "confidence": "high",
      "file": "src/services/searchApi.ts",
      "lineStart": 24,
      "lineEnd": 38,
      "evidence": "api.get(`/search?q=${query}`) called on each keystroke without cancelling previous in-flight requests",
      "impact": "Slow earlier search query resolves after faster later search query, displaying stale results for current input",
      "recommendation": "Attach an AbortController signal or compare request timestamps/IDs before applying search results",
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
| `ruleId` | string | Yes | FAI01–FAI10 stable identifier |
| `title` | string | Yes | Concise issue summary |
| `severity` | string | Yes | `critical`, `high`, `medium`, or `low` |
| `confidence` | string | Yes | `high`, `medium`, or `low` |
| `file` | string | Yes | Repository-relative path |
| `lineStart` | integer | Yes | First line number of the relevant code |
| `lineEnd` | integer | No | End line number of the relevant code block |
| `evidence` | string | Yes | Concrete code observation supporting the issue |
| `impact` | string | Yes | Network failure, contract mismatch, race overwrite, or auth loop |
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

