---
name: skill-eng-backward-compatibility
description: >-
  Activate when reviewing code changes for unintended breaking changes across API and RPC contracts,
  database schema migrations, event and message schemas, configuration keys, serialization formats,
  behavioral contracts, and zero-downtime rolling deployment version skew across Python, Java, C#, Go,
  and TypeScript without penalizing planned, documented version deprecations.
---

# Engineering Backward Compatibility Review Skill

## 1. Purpose & Activation

This skill evaluates pull requests and code modifications for unintended breaking changes, schema regressions, serialization incompatibilities, and version skew risks across published APIs, database schemas, serialized data stores, messaging event schemas, configuration parameters, and client integrations.

**Activate when** code changes modify public REST/gRPC/GraphQL endpoints, database columns/tables/constraints, message queue payloads, environment variables, configuration models, serialization formats, public library interfaces, or enum definitions; or when review context cites breaking client changes, database migration failures during rolling updates, dropped message fields, or configuration key regressions.

Do not report findings for intentional, documented major version bumps, private internal refactorings with no external consumers, or coordinated mono-repo releases where all callers are simultaneously updated.

## 2. Technology Context

Infer the schema and serialization technologies from repository dependencies and imports (e.g., Protobuf, OpenAPI/Swagger, Avro, JSON Schema, SQLAlchemy/Alembic, Entity Framework Core, Flyway/Liquibase, Jackson, Pydantic, System.Text.Json). Apply compatibility principles cross-language (Python, Java, C#, Go, TypeScript), evaluating changes against established consumer contracts and deployment models.

Refer to [`references/checklist.md`](references/checklist.md) for technology-specific detection patterns and examples.

Technology context guides how rules are applied; it is not a standalone review objective. Report only evidence-based compatibility regressions, not findings based solely on subjective versioning preferences.

## 3. Backward Compatibility Rules

| ID | Rule | Objective |
|---|---|---|
| BWC01 | API Endpoint & Parameter Evolution | Prevent removing, renaming, or changing types of public API endpoints, query params, or payload fields. |
| BWC02 | Field Optionality & Validation Tightening | Ensure newly introduced request fields are optional and prevent tightening validation on existing inputs. |
| BWC03 | Response Payload & Property Preservation | Prevent removing existing response properties or changing response data structures relied on by active consumers. |
| BWC04 | Database Schema Expand-and-Contract | Enforce multi-phase (expand-and-contract) schema migrations to support rolling deployments without downtime. |
| BWC05 | Persisted Data & Serialization Fidelity | Ensure stored entities and serialized formats can be read across version upgrades and rollbacks. |
| BWC06 | Event & Webhook Schema Evolution | Guard message payloads, topic schemas, and event headers against breaking changes across decoupled consumers. |
| BWC07 | Configuration & Environment Key Continuity | Maintain backward compatibility for environment variables, config keys, default values, and CLI flags. |
| BWC08 | Enum & Status Domain Evolution | Prevent removing or re-ordering enum values and handle unknown incoming enum variants gracefully. |
| BWC09 | Behavioral & Semantic Invariants | Guard documented business rules, status transitions, pagination mechanics, and error codes against regressions. |
| BWC10 | Compatibility & Migration Test Coverage | Verify automated contract tests, migration rollback tests, and multi-version deserialization test suites. |

*Detailed criteria, evidence, and remediation per rule are defined in [`references/checklist.md`](references/checklist.md).*

## 4. Review Workflow

1. **Identify Modified Contracts**: Review changed diffs, trace public API schemas, database migrations, serialized DTOs, config keys, and event schemas.
2. **Establish Consumer Impacts**: Determine what happens to existing mobile apps, web clients, legacy DB rows, running worker pods, or third-party webhooks.
3. **Verify Evolution Strategy**: Check whether modifications follow non-breaking evolution (additive fields, defaults, multi-step expand-and-contract).
4. **Evaluate Evidence**: Consult [`references/checklist.md`](references/checklist.md) to substantiate findings with visible code patterns.
5. **Score & Deduplicate**: Apply [`references/scoring-guide.md`](references/scoring-guide.md). Consolidate multiple symptoms sharing a single root cause into one finding.
6. **Generate Output**: Format findings using the Scorecard Aggregator schema below.

## 5. Review Principles & False-Positive Safeguards

- **Evidence-Based**: Report compatibility defects supported by concrete code evidence; demonstrate plausible consumer crashes, data corruption, or failed rollouts.
- **Intentional Breaking Changes**: Do not flag breaking changes if the PR explicitly increments the major API version (`/v2/`), introduces an opt-in header, or includes an approved deprecation notice.
- **Private & Internal Scopes**: Do not flag modified internal classes, private helpers, or unexported functions that have no external or persistent consumers.
- **Additive Fields**: Do not flag new optional fields unless the underlying serializer (e.g., strict non-tolerant parser) is known to reject unexpected fields.
- **Coordinated Monorepo Deployments**: Do not demand multi-phase migrations if the service and its sole consumer are guaranteed to deploy synchronously in lockstep.
- **Root-Cause Deduplication**: Multiple symptoms stemming from one underlying contract break must produce one primary finding.

## 6. Skill Boundaries & Delegation

- **RPC & API Design** ([`skill-eng-rpc-api-design`](../skill-eng-rpc-api-design/SKILL.md)): Initial REST/gRPC endpoint structure, status code mappings, and API ergonomics.
- **Provider Adapters** ([`skill-eng-provider-adapters`](../skill-eng-provider-adapters/SKILL.md)): Third-party provider SDK isolation and multi-provider data mapping.
- **Data Access Patterns** ([`skill-eng-data-access-patterns`](../skill-eng-data-access-patterns/SKILL.md)): SQL query performance, indexing, and ORM query efficiency.
- **Async Delivery** ([`skill-eng-async-delivery`](../skill-eng-async-delivery/SKILL.md)): Message acknowledgement timing, consumer idempotency, and retry backoffs.
- **Event Ingestion** ([`skill-eng-event-ingestion`](../skill-eng-event-ingestion/SKILL.md)): Webhook signature verification, replay protection, and intake rate-limiting.
- **Cloud Integration** ([`skill-eng-cloud-integration`](../skill-eng-cloud-integration/SKILL.md)): Cloud identity authentication, IAM tokens, and cloud infrastructure lifecycles.

## 7. Output Contract & References

Return structured output compatible with the Code Review Portal Scorecard Aggregator:

```json
{
  "dimension": "backward_compatibility",
  "score": 8.0,
  "findings": [
    {
      "ruleId": "BWC01",
      "title": "Public API Parameter Renamed Without Deprecation Alias",
      "severity": "high",
      "confidence": "high",
      "file": "src/controllers/user_controller.py",
      "lineStart": 24,
      "lineEnd": 30,
      "evidence": "Query parameter 'user_id' renamed to 'account_id' on public GET /api/v1/users endpoint",
      "impact": "Breaks existing API consumers and mobile apps that send 'user_id', causing 400 Bad Request errors",
      "recommendation": "Accept both 'user_id' and 'account_id' with fallback alias, deprecating 'user_id' gracefully",
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
| `ruleId` | string | Yes | BWC01–BWC10 stable identifier |
| `title` | string | Yes | Concise issue summary |
| `severity` | string | Yes | `critical`, `high`, `medium`, or `low` |
| `confidence` | string | Yes | `high`, `medium`, or `low` |
| `file` | string | Yes | Repository-relative path |
| `lineStart` | integer | Yes | First line number of the relevant code |
| `lineEnd` | integer | No | End line number of the relevant code block |
| `evidence` | string | Yes | Concrete code observation supporting the issue |
| `impact` | string | Yes | Plausible reliability, client breakage, or migration failure impact |
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

