# Frontend Security Scoring Guide & Scorecard Aggregator Reference

This guide defines how findings from `SKILL.md` rules FSEC01–FSEC10 are classified and how the frontend security dimension score and merge-blocking decisions are calculated directly on a native **0.0–10.0 scale** for the Code Review Portal's Scorecard Aggregator.

---

## 1. Severity Classification & Base Deductions

Severity reflects the **demonstrated exploitability and impact** of the client-side security vulnerability across rules FSEC01–FSEC10 (e.g. unsanitized HTML sinks FSEC01, dangerous URL schemes/open redirects FSEC02, client-bundled secrets FSEC03, insecure token storage FSEC04, client-only authorization FSEC05, CSRF/cross-origin request misconfigurations FSEC06, unsafe postMessage origin validation FSEC07, dynamic script injection FSEC08, sensitive data in browser storage FSEC09, and debug exposure in production builds FSEC10).

| Severity | Base Deduction (0–10 Scale) | Definition & Operational Impact |
|---|---|---|
| **critical** | 6.0 | Severe exploitable vulnerability: direct XSS via unsanitized DOM sink (FSEC01), hardcoded private signing key or backend secret (FSEC03), or arbitrary code execution. Triggers unconditional merge block. |
| **high** | 4.0 | Major security risk: dangerous URL navigation allowing `javascript:` execution or open redirect (FSEC02), insecure token leakage (FSEC04), false client-only authorization boundary (FSEC05), CSRF misconfiguration (FSEC06), unvalidated postMessage receiver/sender (FSEC07), or untrusted dynamic script injection (FSEC08). |
| **medium** | 2.0 | Moderate security issue: sensitive PII stored in unencrypted browser storage (FSEC09), or exposed debug hooks/test routes in client bundle (FSEC10). |
| **low** | 1.0 | Minor security concern: missing `rel="noopener"` on non-sensitive links or minor configuration discrepancy. |

---

## 2. Confidence and Uncertainty Handling

Confidence measures how strongly code evidence supports a finding:

| Confidence | Multiplier | Definition |
|---|---|---|
| **high** | 1.00 | Vulnerability is directly visible in the diff with verifiable exploit flow from untrusted source to dangerous sink. |
| **medium** | 0.70 | Insecure pattern is visible, but server-side defense-in-depth or external sanitizer context is partially obscured. |
| **low** | 0.30 | Concern is speculative or relies on unverified backend behavior without direct code evidence. |

**Low-confidence concerns must not be reported as findings.** Instead, record an `uncertainty_note` at the dimension level (0.0 score deduction).

---

## 3. Native 0–10 Score Calculation

Frontend security scores are calculated directly on a **0.0 to 10.0 scale** from start to finish without any intermediate 0–100 calculation or division:

```
deduction = round(base_deduction × confidence_multiplier)
final_score = max(0.0, min(10.0, 10.0 - sum(deductions)))
```

- **Starting Score:** Initialized at `10.0`.
- **Deductions:** Applied directly on the 0–10 scale.
- **Precision:** Rounded to one decimal place (`X.X`) and clamped within `[0.0, 10.0]`.

### Deduplication and Documented Exceptions
- **Duplicate Findings:** Multiple unsafe rendering instances in a single component produce **one primary finding** under the most specific applicable rule ID (FSEC01–FSEC10).
- **Approved Exceptions:** Documented internal prototype tools or sandboxed staging harnesses reduce deductions by **50%** with `status: "accepted"`.

---

## 4. Standard Scoring and Blocking Rubric

The frontend security review enforces the standard merge-blocking policy:

| Score | Status | Description & Blocking Rule |
|---|---|---|
| **10.0 (10/10)** | ✅ **Pass** | **Zero confirmed violations.** Clean client-side security posture with safe rendering and origin controls. |
| **9.0 (9/10)** | ✅ **Pass with minor issues** | **At most one minor (low) non-blocking violation.** No medium, high, or critical security vulnerabilities. |
| **< 9.0 (< 9/10)** | ❌ **Rejected / Blocked** | **Merge blocked.** Any critical violation or cumulative high/medium violations reducing score below 9.0. |

---

## 5. Scorecard Output Example

```json
{
  "dimension": "frontend_security",
  "score": 4.0,
  "findings": [
    {
      "ruleId": "FSEC01",
      "title": "Stored XSS via Unsanitized dangerouslySetInnerHTML",
      "severity": "critical",
      "confidence": "high",
      "file": "src/components/ArticleView.tsx",
      "lineStart": 18,
      "lineEnd": 22,
      "evidence": "<div dangerouslySetInnerHTML={{ __html: article.content }} /> without DOMPurify sanitization",
      "impact": "Allows arbitrary JavaScript execution in victim's browser context, leading to session hijacking",
      "recommendation": "Pass article.content through DOMPurify.sanitize() before setting dangerouslySetInnerHTML",
      "technology": "React/TypeScript",
      "status": "open"
    }
  ],
  "uncertainty_notes": [],
  "blocked": true
}
```

