---
name: skill-eng-cloud-integration
description: >-
  Activate when reviewing code changes for cloud services, external infrastructure,
  cloud SDK client lifecycles, managed identities, blob/object storage, network timeouts,
  rate limits, provider pagination, and cloud resource configurations across AWS, Azure,
  and GCP in Python, Java, C#, Go, and TypeScript without enforcing subjective style preferences.
---

# Engineering Cloud Integration Review Skill

## 1. Purpose & Activation

This skill evaluates pull requests and code modifications for defects in cloud service integrations, external infrastructure communication, cloud SDK client lifecycles, managed identity usage, object storage operations, network timeouts, rate limiting, and infrastructure-as-code definitions across multi-cloud environments (AWS, Azure, GCP).

**Activate when** code changes modify cloud SDK client initializations (e.g., `boto3`, Azure SDK, Google Cloud Client Libraries), managed identity or workload credentials, object storage uploads/downloads (S3, Blob, GCS), cloud API pagination, external HTTP/RPC connection lifecycles, network timeouts, cloud secrets rotation, or cloud infrastructure definitions; or when review context cites cloud service timeouts, SDK credential misconfigurations, object stream leaks, or unhandled cloud rate limits.

Do not report findings merely because simple scripts use standard default SDK client constructors or delegate connection pooling and retry management to the surrounding cloud runtime.

## 2. Technology Context

Infer the target cloud provider and SDK from repository dependencies, imports, and configuration files (e.g., AWS SDK/Boto3, Azure SDK, Google Cloud Client Libraries, Terraform, ARM/Bicep, CloudFormation). Apply provider-specific semantics conditionally only when the target cloud environment is established from concrete evidence.

Refer to [`references/checklist.md`](references/checklist.md) for technology-specific detection patterns and examples across AWS, Azure, and GCP.

Technology context guides how rules are applied; it is not a standalone review objective. Report only evidence-based cloud integration defects, not findings based solely on cloud provider preferences.

## 3. Cloud Integration Rules

| ID | Rule | Objective |
|---|---|---|
| CLD01 | Cloud Identity & Managed Authentication | Prevent hardcoded cloud credentials and ensure correct managed identity or workload federation usage. |
| CLD02 | Secrets Management & Dynamic Resolution | Prevent static secrets in source/config and ensure dynamic KMS/Secrets Manager resolution with rotation. |
| CLD03 | Network Timeouts & Cancellation Propagation | Enforce explicit connect/read timeouts and deadline propagation on all external cloud API and SDK calls. |
| CLD04 | Cloud SDK Client Lifecycle & Connection Reuse | Ensure cloud SDK clients and HTTP connection pools are reused rather than instantiated per-request. |
| CLD05 | Cloud Pagination & Quota Control | Handle provider pagination tokens completely and enforce batching to prevent truncation and quota exhaustion. |
| CLD06 | Transient Throttling & Backoff Alignment | Handle cloud rate limiting (HTTP 429/503) with jittered backoff without retrying non-idempotent side effects. |
| CLD07 | Object Storage Streaming & Integrity | Prevent unbounded in-memory object buffering, ensure stream cleanup, and verify checksums on transfers. |
| CLD08 | Object Path Safety & Access Scoping | Validate object keys against directory traversal and prevent unintended public bucket/container exposure. |
| CLD09 | Cloud Resource Lifecycle & Cleanup | Ensure transient cloud resources (temp blobs, signed URLs, compute tasks) have explicit cleanup or TTLs. |
| CLD10 | Infrastructure & Environment Parity | Prevent hardcoded environment endpoints and ensure production environments do not fall back to dev config. |

*Detailed criteria, evidence, and remediation per rule are defined in [`references/checklist.md`](references/checklist.md).*

## 4. Review Workflow

1. **Trace Cloud Boundaries**: Review changed diffs, trace execution flow through SDK client initialization, identity configuration, and API invocations.
2. **Establish Consequences**: Determine what happens during network failures, throttles, large payloads, or missing configuration.
3. **Verify Contract & Boundaries**: Confirm whether the behavior violates cloud authentication contracts, connection reuse, stream disposal, or resource limits.
4. **Evaluate Evidence**: Consult [`references/checklist.md`](references/checklist.md) to substantiate findings with visible code patterns.
5. **Score & Deduplicate**: Apply [`references/scoring-guide.md`](references/scoring-guide.md). Consolidate multiple symptoms sharing a single root cause into one finding.
6. **Generate Output**: Format findings using the Scorecard Aggregator schema below.

## 5. Review Principles & False-Positive Safeguards

- **Evidence-Based**: Report cloud integration defects supported by concrete code evidence; demonstrate plausible authentication failures, connection pool starvation, memory exhaustion, or security exposure.
- **Enclosing Infrastructure Timeouts**: Do not flag missing SDK client timeouts if verified enclosing runtime middleware (e.g., API Gateway, Lambda timeout, Envoy proxy) guarantees bounded execution.
- **Do Not Mandate Unnecessary Abstractions**: Do not demand repository-wide abstraction wrappers over provider SDKs for simple, direct integration services unless specified by architecture.
- **Provider Semantics Are Not Interchangeable**: Do not apply AWS IAM assumptions to Azure Managed Identity or GCP Service Accounts without verified provider context.
- **Non-Sensitive Config Is Safe**: Do not flag standard configuration flags, region identifiers, or non-confidential bucket names as leaked secrets.
- **Root-Cause Deduplication**: Multiple symptoms stemming from one underlying cloud integration defect must produce one primary finding.

## 6. Skill Boundaries & Delegation

- **Security** ([`skill-eng-security`](../skill-eng-security/SKILL.md)): Generic OWASP vulnerabilities, authorization models, and static vulnerability scanning.
- **Observability** ([`skill-eng-observability`](../skill-eng-observability/SKILL.md)): Distributed tracing spans, metrics collection, and log format standards.
- **Error Handling** ([`skill-eng-error-handling`](../skill-eng-error-handling/SKILL.md)): Generic exception hierarchies, process crashes, and try/catch mechanics.
- **Event Ingestion** ([`skill-eng-event-ingestion`](../skill-eng-event-ingestion/SKILL.md)): Webhook signature verification, replay protection, and inbound HTTP acceptance.
- **Data Access** ([`skill-eng-data-access-patterns`](../skill-eng-data-access-patterns/SKILL.md)): Relational database schemas, ORM queries, and ACID transaction semantics.
- **Performance** ([`skill-eng-performance`](../skill-eng-performance/SKILL.md)): General algorithm complexity, CPU bottlenecks, and memory caching.

## 7. Output Contract & References

Return structured output compatible with the Code Review Portal Scorecard Aggregator:

```json
{
  "dimension": "cloud_integration",
  "score": 8.0,
  "findings": [
    {
      "ruleId": "CLD01",
      "title": "Hardcoded Cloud Access Key in SDK Initialization",
      "severity": "critical",
      "confidence": "high",
      "file": "src/services/storage_client.py",
      "lineStart": 18,
      "lineEnd": 22,
      "evidence": "boto3.client('s3', aws_access_key_id='AKIA...', aws_secret_access_key='...') hardcodes plaintext credentials",
      "impact": "Exposes production AWS credentials in source control leading to potential cloud infrastructure compromise",
      "recommendation": "Use IAM Roles / AWS Workload Identity and initialize boto3.client('s3') using default credential provider chain",
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
| `ruleId` | string | Yes | CLD01–CLD10 stable identifier |
| `title` | string | Yes | Concise issue summary |
| `severity` | string | Yes | `critical`, `high`, `medium`, or `low` |
| `confidence` | string | Yes | `high`, `medium`, or `low` |
| `file` | string | Yes | Repository-relative path |
| `lineStart` | integer | Yes | First line number of the relevant code |
| `lineEnd` | integer | No | End line number of the relevant code block |
| `evidence` | string | Yes | Concrete code observation supporting the issue |
| `impact` | string | Yes | Plausible reliability, security, or resource impact |
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

