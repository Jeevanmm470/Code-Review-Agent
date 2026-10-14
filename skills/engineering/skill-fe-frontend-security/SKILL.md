---
name: skill-fe-frontend-security
description: >-
  Activate when reviewing frontend code changes for client-side security risks, cross-site scripting (XSS),
  dangerous HTML rendering sinks, unsafe URL navigation, client-exposed secrets, insecure token storage,
  false client-side authorization boundaries, unsafe postMessage communication, untrusted third-party scripts,
  and sensitive data exposure in browser storage across React, Angular, Vue, Svelte, Blazor, TypeScript, and JavaScript.
---

# Frontend Security Engineering Review Skill

## 1. Purpose & Activation

This skill evaluates pull requests and code modifications for client-side security vulnerabilities, dangerous DOM sinks, Cross-Site Scripting (XSS), unvalidated URL redirects, client-bundled secrets, insecure authentication token handling, false client-side authorization assumptions, unsafe cross-origin browser messaging (`postMessage`), dynamic script injection risks, and sensitive data leakage in browser storage across React, Angular, Vue, Svelte, Blazor, TypeScript, and JavaScript frontend applications.

**Activate when** code changes modify UI components, rendering logic, routing, URL query parsing, authentication tokens, session storage, browser storage (`localStorage`, `sessionStorage`, `IndexedDB`), cross-origin messaging (`window.postMessage`, `window.addEventListener('message')`), dynamic script loading, frontend environment configuration, or client API clients; or when review context cites frontend XSS, open redirects, exposed API keys, or client-side authorization bypasses.

Do not report findings solely because code renders dynamic text using standard framework escaping (e.g. `{text}`, `{{text}}`), uses client-side routing, or reads non-sensitive environment variables intended for client bundle consumption.

## 2. Technology Context

Infer the frontend framework, runtime, and UI libraries from changed files, imports, and project manifests (e.g. React/JSX, Angular templates, Vue SFCs, Svelte, Blazor Razor components, vanilla JavaScript/TypeScript). Apply browser security models and client-side trust boundary principles cross-technology, evaluating code against framework-specific escape hatches and DOM sink APIs.

Refer to [`references/checklist.md`](references/checklist.md) for framework-specific detection patterns and examples.

Technology context guides how rules are applied; it is not a standalone review objective. Report only evidence-based frontend security defects, not findings based solely on stylistic UI component preferences.

## 3. Frontend Security Rules

| ID | Rule | Objective |
|---|---|---|
| FSEC01 | Unsafe HTML Rendering & Dangerous DOM Sinks | Prevent DOM/Reflected XSS by eliminating unsanitized HTML sinks (`dangerouslySetInnerHTML`, `v-html`, `bypassSecurityTrustHtml`, `innerHTML`). |
| FSEC02 | Dangerous URL Schemes & Client Open Redirects | Block executable URL schemes (`javascript:`, `data:`) and unvalidated client-side redirects to arbitrary untrusted origins. |
| FSEC03 | Client-Side Secrets & Sensitive Build Artifacts | Prevent bundling private API keys, signing secrets, service credentials, and backend tokens into public frontend code. |
| FSEC04 | Insecure Client Token Handling & Session State | Ensure authentication tokens and session credentials are protected from script exfiltration and purged upon logout. |
| FSEC05 | Client-Side Only Authorization & False Boundaries | Prevent relying exclusively on hidden UI elements, disabled buttons, or frontend role checks without server enforcement. |
| FSEC06 | Cross-Origin Request Safety & Client CSRF Misconfiguration | Ensure state-changing requests use anti-CSRF headers, correct `SameSite` cookie expectations, and safe credential modes. |
| FSEC07 | Unsafe Browser Messaging & Cross-Origin postMessage | Enforce strict origin validation on `window.addEventListener('message')` and prevent wildcard target origins in `postMessage`. |
| FSEC08 | Dynamic Script Injection & Third-Party Integrity | Prevent unsanitized dynamic `<script>` creation, untrusted CDN script loading, and enforce Subresource Integrity (SRI). |
| FSEC09 | Sensitive Data Exposure in Browser Storage | Prevent storing plaintext passwords, PII, payment details, or unencrypted sensitive records in `localStorage` or `sessionStorage`. |
| FSEC10 | Insecure Frontend Configuration & Debug Exposure | Prevent shipping development debug hooks, admin testing harnesses, and sensitive diagnostic paths in production builds. |

*Detailed criteria, evidence, and remediation per rule are defined in [`references/checklist.md`](references/checklist.md).*

## 4. Review Workflow

1. **Examine Changed Code**: Identify all UI rendering sinks, navigation handlers, storage access, postMessage listeners, and environment variable references in the diff.
2. **Trace Untrusted Data Flow**: Follow data from sources (URL params, query strings, postMessage payloads, user input, external APIs) to sinks (`innerHTML`, `href`, `localStorage`, `eval`).
3. **Assess Framework Protections**: Verify whether the framework automatically escapes the context or if an explicit bypass mechanism was invoked.
4. **Evaluate Evidence**: Consult [`references/checklist.md`](references/checklist.md) to substantiate findings with visible code patterns and plausible exploit scenarios.
5. **Score & Deduplicate**: Apply [`references/scoring-guide.md`](references/scoring-guide.md). Consolidate multiple symptoms sharing a single root cause into one finding.
6. **Generate Output**: Format findings using the Scorecard Aggregator schema below.

## 5. Review Principles & False-Positive Safeguards

- **Evidence-Based Exploitability**: Report frontend security defects supported by visible code evidence; demonstrate a credible attack path from an untrusted source to a dangerous sink.
- **Framework Auto-Escaping Awareness**: Do not flag standard JSX `{expr}`, Angular `{{expr}}`, or Vue `{{expr}}` as XSS when the framework safely encodes HTML entities by default.
- **Public vs Secret Environment Variables**: Distinguish public configuration (e.g. public API base URLs, Firebase public API keys, Stripe publishable keys) from true private secrets (e.g. backend private keys, Stripe secret keys).
- **Sanitized HTML Sinks**: Do not flag `dangerouslySetInnerHTML` or `v-html` if input is explicitly sanitized by a trusted, properly configured library (e.g. DOMPurify).
- **Client vs Server Authorization**: When flagging client-only UI checks (FSEC05), record uncertainty if backend endpoint enforcement cannot be verified from the frontend diff.
- **Root-Cause Deduplication**: Multiple unsafe links in a single component should be consolidated into one primary finding under `FSEC02`.

## 6. Skill Boundaries & Delegation

- **Backend Security** ([`skill-eng-security`](../skill-eng-security/SKILL.md)): SQL injection, SSRF, server-side authentication/authorization, and server cryptographic security.
- **Error Handling** ([`skill-eng-error-handling`](../skill-eng-error-handling/SKILL.md)): Client-side error boundaries, toast notifications, and failure recovery.
- **Test Quality** ([`skill-eng-test-quality`](../skill-eng-test-quality/SKILL.md)): Frontend component test assertions, mock fidelity, and test coverage.
- **Maintainability** ([`skill-eng-maintainability`](../skill-eng-maintainability/SKILL.md)): Frontend component structuring, state management, and code readability.
- **Backward Compatibility** ([`skill-eng-backward-compatibility`](../skill-eng-backward-compatibility/SKILL.md)): Frontend public component props and API contract compatibility.

## 7. Output Contract & References

Return structured output compatible with the Code Review Portal Scorecard Aggregator:

```json
{
  "dimension": "frontend_security",
  "score": 6.0,
  "findings": [
    {
      "ruleId": "FSEC01",
      "title": "Unsanitized User Content Rendered via dangerouslySetInnerHTML",
      "severity": "critical",
      "confidence": "high",
      "file": "src/components/UserProfile.tsx",
      "lineStart": 24,
      "lineEnd": 28,
      "evidence": "<div dangerouslySetInnerHTML={{ __html: user.bio }} /> without sanitization",
      "impact": "Enables stored or DOM-based Cross-Site Scripting (XSS), allowing attacker scripts to hijack user sessions",
      "recommendation": "Sanitize user.bio using DOMPurify.sanitize() before rendering or use standard text interpolation",
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
| `ruleId` | string | Yes | FSEC01–FSEC10 stable identifier |
| `title` | string | Yes | Concise issue summary |
| `severity` | string | Yes | `critical`, `high`, `medium`, or `low` |
| `confidence` | string | Yes | `high`, `medium`, or `low` |
| `file` | string | Yes | Repository-relative path |
| `lineStart` | integer | Yes | First line number of the relevant code |
| `lineEnd` | integer | No | End line number of the relevant code block |
| `evidence` | string | Yes | Concrete code observation supporting the vulnerability |
| `impact` | string | Yes | XSS, session hijacking, credential theft, open redirect, or data leak |
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

