# Cloud Integration Scoring Guide

This guide defines how findings from `SKILL.md` rules CLD01–CLD10 are classified and how the cloud integration dimension score and merge-blocking decisions are calculated directly on a native **0.0–10.0 scale** for the Code Review Portal's Scorecard Aggregator.

---

## 1. Severity Classification & Base Deductions

Severity reflects the **demonstrated impact** of the cloud integration defect on system security, reliability, operational stability, and resource control across rules CLD01–CLD10 (e.g. hardcoded credentials CLD01, exposed secrets CLD02, missing network timeouts CLD03, un-pooled SDK clients CLD04, unhandled pagination CLD05, un-backoffed throttling CLD06, memory-buffering streams CLD07, object path traversal CLD08, orphaned resources CLD09, and environment misconfigurations CLD10).

| Severity | Base Deduction (0–10 Scale) | Definition & Operational Impact |
|---|---|---|
| **critical** | 6.0 | Severe defect causing hardcoded cloud credentials, unauthenticated storage exposure, arbitrary path traversal in object keys, or secrets committed in code. Triggers unconditional merge block. |
| **high** | 4.0 | Major reliability defect: missing network timeouts causing hung threads, un-pooled SDK clients causing socket exhaustion, silent pagination truncation, or memory exhaustion on large blobs. |
| **medium** | 2.0 | Moderate defect: excessive presigned URL lifetimes, missing jitter on retry backoffs, or missing non-critical telemetry spans. |
| **low** | 1.0 | Minor issue: slight timeout tolerance imprecision or minor configuration naming discrepancies without operational failure. |

---

## 2. Confidence and Uncertainty Handling

Confidence measures how strongly code evidence supports a finding:

| Confidence | Multiplier | Definition |
|---|---|---|
| **high** | 1.00 | Finding is directly visible in the diff with unambiguous evidence of defect and impact. |
| **medium** | 0.70 | Pattern is visibly defective, but enclosing framework, cloud platform defaults, or caller recovery logic is only partially visible. |
| **low** | 0.30 | Concern is speculative or depends on unverified assumptions about runtime cloud configuration. |

**Low-confidence concerns must not be reported as findings.** Instead, record an `uncertainty_note` at the dimension level (0.0 score deduction).

---

## 3. Native 0–10 Score Calculation

Cloud integration scores are calculated directly on a **0.0 to 10.0 scale** from start to finish without any intermediate 0–100 calculation or division:

```
deduction = round(base_deduction × confidence_multiplier)
final_score = max(0.0, min(10.0, 10.0 - sum(deductions)))
```

- **Starting Score:** Initialized at `10.0`.
- **Deductions:** Applied directly on the 0–10 scale.
- **Precision:** Rounded to one decimal place (`X.X`) and clamped within `[0.0, 10.0]`.

### Deduplication and Documented Exceptions
- **Duplicate Findings:** Multiple symptoms stemming from one underlying cloud integration defect produce **one primary finding** under the most specific applicable rule ID (CLD01–CLD10).
- **Approved Exceptions:** Documented trade-offs (e.g. deliberate short-lived script using default credentials) reduce deductions by **50%** with `status: "accepted"`.

---

## 4. Standard Scoring and Blocking Rubric

The cloud integration review enforces the standard merge-blocking policy:

| Score | Status | Description & Blocking Rule |
|---|---|---|
| **10.0 (10/10)** | ✅ **Pass** | **Zero confirmed violations.** Robust, secure, and resilient cloud service integration. |
| **9.0 (9/10)** | ✅ **Pass with minor issues** | **At most one minor (low) non-blocking violation.** No medium, high, or critical cloud integration risks. |
| **< 9.0 (< 9/10)** | ❌ **Rejected / Blocked** | **Merge blocked.** Any critical violation or cumulative high/medium violations reducing score below 9.0. |

---

## 5. Scorecard Output Example

```json
{
  "dimension": "cloud_integration",
  "score": 4.0,
  "findings": [
    {
      "ruleId": "CLD01",
      "title": "Hardcoded AWS Access Key in S3 Client Initializer",
      "severity": "critical",
      "confidence": "high",
      "file": "src/services/s3_client.py",
      "lineStart": 14,
      "lineEnd": 19,
      "evidence": "boto3.client('s3', aws_access_key_id='AKIA...', aws_secret_access_key='...') hardcodes plaintext credentials.",
      "impact": "Exposes production AWS credentials in source control leading to cloud infrastructure compromise.",
      "recommendation": "Use IAM Roles / AWS Workload Identity and initialize boto3.client('s3') using default credential provider chain.",
      "technology": "Python",
      "status": "open"
    }
  ],
  "uncertainty_notes": [],
  "blocked": true
}
```

