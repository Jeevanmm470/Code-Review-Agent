---
name: skill-fe-accessibility
description: >-
  Activate when reviewing frontend code changes involving HTML semantics, interactive controls, ARIA attributes,
  keyboard navigation, focus management, form labels/errors, color contrast, alt text, live regions, or WCAG criteria
  across React, Angular, Vue, Svelte, Blazor, TypeScript, and JavaScript.
---

# Frontend Accessibility Engineering Review Skill

## 1. Purpose & Activation

This skill evaluates pull requests and code modifications for accessibility (a11y) barriers that prevent or impair people with disabilities from perceiving, operating, navigating, or understanding frontend applications. It inspects HTML semantic elements, keyboard event handling, ARIA roles/states, accessible naming computation, focus traps/containment, form validation linkages, media alternative text, dynamic live announcements, and WCAG conformance across React, Angular, Vue, Svelte, Blazor, TypeScript, and JavaScript applications.

**Activate when** code changes introduce or modify UI templates/JSX, interactive controls (buttons, links, dialogs, dropdowns, tabs), form inputs and validation feedback, event listeners (`onClick`, `onKeyDown`), ARIA attributes (`aria-*`, `role`), modal dialog focus loops, media elements (`<img>`, `<video>`, `<svg>`), or CSS styling affecting visibility, focus indicators, and visual layout.

Do not report findings solely because code uses native semantic elements without ARIA attributes (native semantics are preferred), or flag decorative images that correctly use `alt=""` or `aria-hidden="true"`.

## 2. Technology Context

Infer the frontend framework, component library, and templating engine from imports, component definitions, and package manifests (e.g. React JSX, Vue templates, Angular templates, Svelte components, Headless UI, Radix Primitives, React Aria, Material UI). Apply universal accessibility principles (POUR: Perceivable, Operable, Understandable, Robust) and WCAG 2.1/2.2 AA standards across all UI technologies.

Refer to [`references/checklist.md`](references/checklist.md) for paradigm-specific detection patterns and examples.

Technology context guides how rules are applied; it is not a standalone review objective. Report only concrete, evidenced accessibility barriers affecting actual assistive technology or keyboard interactions.

## 3. Frontend Accessibility Rules

| ID | Rule | Objective |
|---|---|---|
| FA11Y01 | Semantic HTML & Interactive Controls | Prevent `div`/`span` clickable elements lacking keyboard support and invalid interactive nesting. |
| FA11Y02 | Accessible Names & Label Associations | Ensure all inputs, icon-only buttons, and links possess meaningful programmatic accessible names. |
| FA11Y03 | Keyboard Navigation & Custom Widgets | Enforce full keyboard operability (Tab, Enter, Space, Arrows, Escape) without keyboard traps. |
| FA11Y04 | Focus Visibility & Dialog Management | Preserve visible focus indicators and ensure modal dialogs trap, contain, and restore focus on close. |
| FA11Y05 | ARIA Semantics, Roles & State Sync | Eliminate invalid ARIA roles, dangling ID references, and out-of-sync `aria-expanded`/`aria-selected`. |
| FA11Y06 | Form Labels, Validation & Error Links | Programmatically link inputs with descriptive labels, `aria-required`, and `aria-describedby` errors. |
| FA11Y07 | Visual Contrast & Non-Color Cues | Ensure essential text/controls meet contrast minimums and do not convey information solely via color. |
| FA11Y08 | Images, Icons & Media Alternatives | Provide descriptive `alt` text on informative images and correctly hide decorative/duplicate icons. |
| FA11Y09 | Dynamic Content & Live Announcements | Announce asynchronous status updates and errors via `aria-live` without causing spammy focus jumps. |
| FA11Y10 | Motion, Touch Targets & Reflow Safety | Support `prefers-reduced-motion`, maintain min 24x24/44x44px touch targets, and avoid horizontal zoom clipping. |

*Detailed criteria, evidence, and remediation per rule are defined in [`references/checklist.md`](references/checklist.md).*

## 4. Review Workflow

1. **Inspect Interactive Elements**: Identify all click/press handlers, verifying native elements (`<button>`, `<a>`) or custom `role` + keyboard support.
2. **Verify Accessible Names & Forms**: Check labels, `aria-label`, icon buttons, and `aria-describedby` error associations on form inputs.
3. **Trace Focus & Keyboard Traps**: Inspect modal dialogs, drawers, and menus for focus containment, Escape key dismissal, and focus restoration.
4. **Evaluate ARIA & Dynamic Status**: Check `aria-expanded`/`aria-selected` state syncing and `aria-live` region announcements on async updates.
5. **Score & Deduplicate**: Apply [`references/scoring-guide.md`](references/scoring-guide.md). Consolidate multiple symptoms sharing a single a11y defect.
6. **Generate Output**: Format findings using the Scorecard Aggregator schema below.

## 5. Review Principles & False-Positive Safeguards

- **First Rule of ARIA**: Prefer native semantic HTML elements (`<button>`, `<input>`, `<dialog>`) over custom ARIA elements; do not flag lack of ARIA if native semantics suffice.
- **Decorative Images**: Do not require descriptive text for purely decorative images or icons accompanied by adjacent visible text (`alt=""` or `aria-hidden="true"` is correct).
- **Evidence-Based Barrier**: Report defects supported by concrete code evidence; demonstrate how keyboard users or screen readers are blocked.
- **No Speculative Contrast Claims**: Do not guess CSS hex values or assert contrast failures unless color tokens/values are directly established in code.
- **No Arbitrary Heading Rules**: Do not flag non-sequential heading levels (`<h1>` followed by `<h3>`) unless it creates genuine structural disorientation.
- **Root-Cause Deduplication**: Multiple missing label errors in a single custom input component should be consolidated under `FA11Y02`.

## 6. Skill Boundaries & Coordination

- **Component Design** ([`skill-fe-component-design`](../skill-fe-component-design/SKILL.md)): Component composition, prop contracts, and presentation/business logic separation.
- **Frontend Security** ([`skill-fe-frontend-security`](../skill-fe-frontend-security/SKILL.md)): DOM sanitization, XSS in rendered state, and sensitive credential leakage.
- **State Management** ([`skill-fe-state-management`](../skill-fe-state-management/SKILL.md)): Async race conditions, reactive store updates, and optimistic rollbacks.
- **API Integration** ([`skill-fe-api-integration`](../skill-fe-api-integration/SKILL.md)): HTTP status code handling, serialization errors, and token refresh loops.
- **Engineering Test Quality** ([`skill-eng-test-quality`](../skill-eng-test-quality/SKILL.md)): Automated a11y testing suite assertions (axe-core, jest-axe) and testing coverage.

## 7. Output Contract & References

Return structured output compatible with the Code Review Portal Scorecard Aggregator:

```json
{
  "dimension": "frontend_accessibility",
  "score": 6.0,
  "findings": [
    {
      "ruleId": "FA11Y01",
      "title": "Clickable div lacks keyboard operability and button role",
      "severity": "high",
      "confidence": "high",
      "file": "src/components/ActionCard.tsx",
      "lineStart": 14,
      "lineEnd": 22,
      "evidence": "<div onClick={handleDelete} className=\"delete-btn\">Delete</div> lacks tabIndex, onKeyDown, and role=\"button\"",
      "impact": "Keyboard-only and screen reader users cannot focus, discover, or trigger the delete action (WCAG 2.1.1 Keyboard)",
      "recommendation": "Replace the clickable div with a native <button type=\"button\"> element",
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
| `ruleId` | string | Yes | FA11Y01–FA11Y10 stable identifier |
| `title` | string | Yes | Concise issue summary |
| `severity` | string | Yes | `critical`, `high`, `medium`, or `low` |
| `confidence` | string | Yes | `high`, `medium`, or `low` |
| `file` | string | Yes | Repository-relative path |
| `lineStart` | integer | Yes | First line number of the relevant code |
| `lineEnd` | integer | No | End line number of the relevant code block |
| `evidence` | string | Yes | Concrete code observation supporting the barrier |
| `impact` | string | Yes | Inaccessible control, screen-reader silence, or WCAG non-conformance |
| `recommendation` | string | Yes | Actionable remediation using native HTML or ARIA |
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

