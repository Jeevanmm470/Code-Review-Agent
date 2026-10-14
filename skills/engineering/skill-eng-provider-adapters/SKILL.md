---
name: skill-eng-provider-adapters
description: >-
  Activate when reviewing code changes for external provider integrations, adapter boundaries,
  multi-provider consistency, canonical data contracts, capability differences, provider selection,
  and normalized error mapping across Python, Java, C#, Go, and TypeScript without enforcing
  subjective style preferences or redundant abstraction layers.
---

# Engineering Provider Adapters Review Skill

## 1. Purpose & Activation

This skill evaluates pull requests and code modifications for defects in external provider integrations, adapter boundaries, canonical data mapping, provider-specific semantic handling, configuration selection, and error translation across multi-provider architectures (e.g., GitHub / GitLab / Bitbucket / Azure DevOps VCS adapters, Stripe / PayPal payment gateways, Twilio / SendGrid communication adapters, AWS / Azure / GCP storage ports).

**Activate when** code changes modify integration interfaces (ports & adapters), provider data mappers, provider selection factories, multi-provider status translators, capability negotiation, or third-party SDK wrappers; or when review context cites leaking provider SDK types into domain layers, inconsistent provider status mappings, dropped fields, or unhandled provider capability gaps.

Do not report findings merely because a simple integration uses direct SDK calls without an adapter interface, exposes intentional provider-specific differences, or implements an alternative valid architectural pattern.

## 2. Technology Context

Infer the integrated providers and target language from repository imports and dependencies (e.g., Octokit / PyGithub / python-gitlab, Stripe SDK, AWS/Azure/GCP SDKs, SendGrid/Twilio). Apply adapter principles cross-language (Python, Java, C#, Go, TypeScript), evaluating implementation correctness against the application's domain contracts and port interfaces.

Refer to [`references/checklist.md`](references/checklist.md) for technology-specific detection patterns and examples.

Technology context guides how rules are applied; it is not a standalone review objective. Report only evidence-based adapter defects, not findings based solely on architectural dogma.

## 3. Provider Adapters Rules

| ID | Rule | Objective |
|---|---|---|
| ADP01 | Domain Boundary & SDK Isolation | Prevent provider-specific SDK classes, response types, and headers from leaking into domain/application layers. |
| ADP02 | Canonical Contract & Data Normalization | Ensure provider payloads, statuses, enums, and IDs are mapped consistently into normalized domain models. |
| ADP03 | Provider Capability & Unsupported Operations | Explicitly handle unsupported provider features without returning misleading successes or partial data. |
| ADP04 | Explicit Provider Selection & Scoping | Ensure provider selection is explicit, validated, and strictly scoped to authenticated tenant configuration. |
| ADP05 | Error Translation & Diagnostic Integrity | Translate provider-specific HTTP/SDK exceptions into domain error contracts while preserving diagnostic context. |
| ADP06 | Pagination Normalization & Complete Traversal | Normalize disparate provider pagination models (cursor, offset, page token) to prevent silent truncation. |
| ADP07 | Rate Limit & Quota Alignment | Translate provider rate-limit and quota headers (`Retry-After`, `X-RateLimit-*`) into unified throttle signals. |
| ADP08 | Authentication & Credential Isolation | Prevent provider credentials and access tokens from cross-contaminating requests or multi-tenant sessions. |
| ADP09 | Versioning & Backward Compatibility | Guard shared contracts against breaking schema changes, new enum values, or deprecated provider endpoints. |
| ADP10 | Multi-Provider Contract Test Coverage | Validate adapter implementations against shared contract test suites to guarantee behavioral substitutability. |

*Detailed criteria, evidence, and remediation per rule are defined in [`references/checklist.md`](references/checklist.md).*

## 4. Review Workflow

1. **Trace Adapter Boundaries**: Review changed diffs, trace execution flow through provider SDK invocations, response mapping, and domain consumption.
2. **Establish Consequences**: Determine what happens when switching providers, encountering unsupported features, receiving upstream schema drift, or hitting rate limits.
3. **Verify Contract & Boundaries**: Confirm whether domain layers remain isolated from SDK types, data mappings preserve all critical fields, and errors are normalized.
4. **Evaluate Evidence**: Consult [`references/checklist.md`](references/checklist.md) to substantiate findings with visible code patterns.
5. **Score & Deduplicate**: Apply [`references/scoring-guide.md`](references/scoring-guide.md). Consolidate multiple symptoms sharing a single root cause into one finding.
6. **Generate Output**: Format findings using the Scorecard Aggregator schema below.

## 5. Review Principles & False-Positive Safeguards

- **Evidence-Based**: Report provider adapter defects supported by concrete code evidence; demonstrate plausible domain pollution, data loss, misclassified statuses, or runtime exceptions.
- **Do Not Mandate Unnecessary Adapters**: Do not flag code for lacking an interface/adapter if the application only connects to a single fixed provider with no requirement for substitutability.
- **Intentional Feature Divergence**: Do not flag differences between providers if the application contract explicitly defines provider-specific feature extensions or flags.
- **Lightweight Normalization**: Do not demand heavy object mapping frameworks if clean native dictionary/dataclass conversions preserve domain integrity.
- **Upstream Error Handling**: Do not demand local `try/catch` wrapping if an enclosing generic HTTP client or interceptor already normalizes provider exceptions.
- **Root-Cause Deduplication**: Multiple symptoms stemming from one underlying adapter defect must produce one primary finding.

## 6. Skill Boundaries & Delegation

- **RPC & API Design** ([`skill-eng-rpc-api-design`](../skill-eng-rpc-api-design/SKILL.md)): Public REST/gRPC endpoint schema design and API contracts.
- **Cloud Integration** ([`skill-eng-cloud-integration`](../skill-eng-cloud-integration/SKILL.md)): Cloud identity, managed credentials, and cloud resource lifecycles.
- **Event Ingestion** ([`skill-eng-event-ingestion`](../skill-eng-event-ingestion/SKILL.md)): Webhook signature verification and inbound payload intake.
- **Async Delivery** ([`skill-eng-async-delivery`](../skill-eng-async-delivery/SKILL.md)): Message queue acknowledgements, retries, and transactional outboxes.
- **Error Handling** ([`skill-eng-error-handling`](../skill-eng-error-handling/SKILL.md)): Generic exception hierarchies, unhandled rejections, and process panics.
- **Security** ([`skill-eng-security`](../skill-eng-security/SKILL.md)): Cross-cutting authorization, static secret scanning, and OWASP policies.

## 7. Output Contract & References

Return structured output compatible with the Code Review Portal Scorecard Aggregator:

```json
{
  "dimension": "provider_adapters",
  "score": 8.0,
  "findings": [
    {
      "ruleId": "ADP01",
      "title": "Provider SDK Type Leaked Across Domain Boundary",
      "severity": "high",
      "confidence": "high",
      "file": "src/services/pull_request_service.py",
      "lineStart": 42,
      "lineEnd": 48,
      "evidence": "Method returns github.PullRequest.PullRequest directly from PyGithub into domain business logic",
      "impact": "Ties application core logic to PyGithub SDK types, preventing substitution with GitLab or Bitbucket adapters",
      "recommendation": "Map github.PullRequest into internal CanonicalPullRequest domain dataclass before returning from adapter",
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
| `ruleId` | string | Yes | ADP01–ADP10 stable identifier |
| `title` | string | Yes | Concise issue summary |
| `severity` | string | Yes | `critical`, `high`, `medium`, or `low` |
| `confidence` | string | Yes | `high`, `medium`, or `low` |
| `file` | string | Yes | Repository-relative path |
| `lineStart` | integer | Yes | First line number of the relevant code |
| `lineEnd` | integer | No | End line number of the relevant code block |
| `evidence` | string | Yes | Concrete code observation supporting the issue |
| `impact` | string | Yes | Plausible maintainability, substitutability, or correctness impact |
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

