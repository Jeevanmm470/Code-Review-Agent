---
name: skill-fe-routing-and-navigation
description: >-
  Activate when reviewing frontend code changes involving router configuration, route definitions, navigation handlers,
  URL search params, query string synchronization, route guards/redirects, deep linking, nested outlets, or route loaders
  across React, Angular, Vue, Svelte, Blazor, TypeScript, and JavaScript.
---

# Frontend Routing and Navigation Engineering Review Skill

## 1. Purpose & Activation

This skill evaluates pull requests and code modifications for frontend routing and navigation defects, including conflicting route definitions, wildcard route precedence shadowing, unencoded/lost query parameters, infinite redirect loops, route guard race conditions, stale component state on parameter changes, broken browser history replacement, unhandled 404 fallbacks, nested layout outlet omissions, and open redirect vulnerabilities across React, Angular, Vue, Svelte, Blazor, TypeScript, and JavaScript applications.

**Activate when** code changes introduce or modify routing modules (React Router, Vue Router, Angular Router, TanStack Router, SvelteKit routing, Blazor `@page`), route navigation components (`Link`, `NavLink`, `router.navigate()`, `useNavigate`), URL search parameter parsers, auth route guards/interceptors, deep linking handlers, route transition lifecycle hooks, or nested layout outlets (`<Outlet />`, `<router-view>`, `<router-outlet>`).

Do not report findings solely because code uses programmatic navigation instead of declarative links when programmatic triggers are legitimate (e.g. form submission redirects), or flag missing URL state persistence for transient UI properties that do not require deep linking.

## 2. Technology Context

Infer the frontend framework, router library, and navigation paradigm from imports, package manifests, and routing table structures (e.g. React Router v6/v7, TanStack Router, Vue Router 4, Angular RouterModule / functional guards, Next.js / Nuxt file-based routes, Blazor NavigationManager). Apply cross-framework routing principles (deterministic matching, URL state synchronization, history stack integrity, guard safety) without bias toward specific file-based or config-based paradigms.

Refer to [`references/checklist.md`](references/checklist.md) for paradigm-specific detection patterns and examples.

Technology context guides how rules are applied; it is not a standalone review objective. Report only evidence-based navigation defects supported by concrete route paths or execution sequences.

## 3. Frontend Routing and Navigation Rules

| ID | Rule | Objective |
|---|---|---|
| FRN01 | Route Definitions & Matching Precedence | Prevent wildcard/catch-all shadowing, overlapping path patterns, and unreachable child routes. |
| FRN02 | Navigation Targets & Dynamic Param Encoding | Ensure dynamic path parameters and query strings are validated, present, and correctly URI-encoded. |
| FRN03 | URL State & Component Synchronization | Ensure route param changes trigger proper state resets and data re-fetching rather than stale views. |
| FRN04 | Query Parameters & Search Params Handling | Preserve meaningful query filters across transitions without duplicate keys or type coercion bugs. |
| FRN05 | Browser History & Navigation Semantics | Prevent broken back-button behavior by using `replace` vs `push` appropriately and avoiding loop traps. |
| FRN06 | Deep Linking & Direct URL Restoration | Ensure routes initialize correctly on direct URL entry and page refresh without relying on in-memory state. |
| FRN07 | Auth Guards & Protected Route Redirects | Prevent infinite redirect loops, unhandled unauthenticated states, and open redirect vulnerabilities. |
| FRN08 | Nested Routes, Layouts & Outlet Boundaries | Ensure nested child routes render within expected parent layout outlets with preserved layout context. |
| FRN09 | Route-Level Data Loading & Race Conditions | Prevent out-of-order route loaders from overwriting active page data during rapid navigation. |
| FRN10 | Route Fallbacks & 404 Error Boundaries | Provide robust fallback routing and error boundaries for unmatched paths and invalid route parameters. |

*Detailed criteria, evidence, and remediation per rule are defined in [`references/checklist.md`](references/checklist.md).*

## 4. Review Workflow

1. **Inspect Route Definitions**: Check route ordering, wildcard `*` positions, parameter syntax, and nested child route hierarchy.
2. **Trace Navigation & Parameter Encoding**: Follow `Link` hrefs and `navigate()` calls, verifying parameter encoding and required context.
3. **Inspect URL Synchronization**: Verify that components listening to route params (`useParams`, `$route.params`) reactively re-fetch data.
4. **Evaluate Guards & Redirects**: Check login redirects, return URL decoding, and termination conditions for redirect cycles.
5. **Score & Deduplicate**: Apply [`references/scoring-guide.md`](references/scoring-guide.md). Consolidate multiple symptoms sharing a single routing root cause.
6. **Generate Output**: Format findings using the Scorecard Aggregator schema below.

## 5. Review Principles & False-Positive Safeguards

- **Evidence-Based Exploitability**: Report routing defects supported by concrete code evidence; demonstrate a specific URL or navigation sequence producing broken UI or redirect loops.
- **Router Semantic Accuracy**: Verify the specific router's matching precedence (e.g. React Router v6 ranked matching vs legacy ordered matching) before asserting route collision.
- **Legitimate Transient State**: Do not require all UI state (e.g. accordion open/close, hover tooltips) to be stored in query params.
- **Client Guards vs Server Auth**: Treat frontend route guards as UX enhancements; coordinate backend data authorization findings with security skills.
- **No Deployment Assumptions**: Do not report missing SPA server fallback rewrite rules unless server configuration files are present in the repository.
- **Root-Cause Deduplication**: Multiple UI inconsistencies caused by a single unhandled route param change should be consolidated under `FRN03`.

## 6. Skill Boundaries & Coordination

- **Frontend Security** ([`skill-fe-frontend-security`](../skill-fe-frontend-security/SKILL.md)): Open redirect vulnerabilities via unvalidated `returnUrl` parameters and XSS in `javascript:` URLs.
- **Frontend State Management** ([`skill-fe-state-management`](../skill-fe-state-management/SKILL.md)): Component store reactivity, local caching stores, and UI derived computations.
- **Frontend API Integration** ([`skill-fe-api-integration`](../skill-fe-api-integration/SKILL.md)): API fetch calls triggered on route change and network race conditions.
- **Frontend Accessibility** ([`skill-fe-accessibility`](../skill-fe-accessibility/SKILL.md)): Keyboard navigation on links, focus management on page transition, and `aria-current="page"`.
- **Engineering Error Handling** ([`skill-eng-error-handling`](../skill-eng-error-handling/SKILL.md)): Generic exception hierarchies, unhandled promise rejections, and global fallback UI.

## 7. Output Contract & References

Return structured output compatible with the Code Review Portal Scorecard Aggregator:

```json
{
  "dimension": "frontend_routing_and_navigation",
  "score": 6.0,
  "findings": [
    {
      "ruleId": "FRN07",
      "title": "Auth guard creates infinite redirect loop between login and protected route",
      "severity": "high",
      "confidence": "high",
      "file": "src/guards/AuthGuard.tsx",
      "lineStart": 14,
      "lineEnd": 28,
      "evidence": "AuthGuard redirects to /login?from=/dashboard, while Login component immediately redirects back to /dashboard before token is set",
      "impact": "Unauthenticated users experience rapid browser redirect loop freezing the page",
      "recommendation": "Check authentication status before triggering redirect and only redirect to destination after verified login completion",
      "technology": "React Router/TypeScript",
      "status": "open"
    }
  ],
  "uncertainty_notes": [],
  "blocked": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `ruleId` | string | Yes | FRN01–FRN10 stable identifier |
| `title` | string | Yes | Concise issue summary |
| `severity` | string | Yes | `critical`, `high`, `medium`, or `low` |
| `confidence` | string | Yes | `high`, `medium`, or `low` |
| `file` | string | Yes | Repository-relative path |
| `lineStart` | integer | Yes | First line number of the relevant code |
| `lineEnd` | integer | No | End line number of the relevant code block |
| `evidence` | string | Yes | Concrete code observation supporting the issue |
| `impact` | string | Yes | Broken navigation, redirect loop, stale page data, or 404 error |
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

