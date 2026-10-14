---
name: skill-ui-html-accessibility
description: >-
  Activate ONLY when authoring or reviewing HTML structure, semantic tags, accessible controls,
  ARIA roles/states, keyboard handling, focus visibility, contrast rules, reflow, or WCAG 2.2 compliance.
  Do NOT activate for design tokens, API integration, backend logic, or non-UI business rules.
---

# UI HTML & Accessibility Engineering Skill

## 1. Purpose & Activation

Provides framework-independent semantic HTML and WCAG 2.2 accessibility guidance for UI development and code review.

**Activate ONLY when** code changes touch HTML structure, DOM elements, ARIA attributes, form inputs, interactive controls, keyboard navigation, focus management, or CSS rules directly affecting accessibility (e.g. focus rings, contrast, reflow).

**Do NOT activate for** general design tokens, unrelated visual styling, API integration, backend logic, or form submission business logic.

## 2. Core Rules Summary

| ID | Rule | Scope & Objective | WCAG Target |
|---|---|---|---|
| A11Y01 | Native Semantics First | Prefer native HTML elements (`<button>`, `<main>`, `<nav>`, `<form>`) over custom `<div>`/`<span>` tags or redundant ARIA. | WCAG 1.3.1, 4.1.2 |
| A11Y02 | Accessible Names & Labels | Ensure all inputs, controls, links, and informative images have explicit accessible names (`<label for>`, `alt`, `aria-label`). | WCAG 1.1.1, 2.4.6, 4.1.2 |
| A11Y03 | Document & Heading Structure | Maintain logical heading hierarchies (`<h1>`–`<h6>`) and semantic landmarks for screen reader navigation. | WCAG 1.3.1, 2.4.1 |
| A11Y04 | Keyboard Operability & Focus | Ensure interactive controls are keyboard operable, maintain unobscured visible focus, logical tab order, and modal focus control. | WCAG 2.1.1, 2.4.3, 2.4.7, 2.4.11 |
| A11Y05 | Valid & Essential ARIA | Use ARIA roles, states (`aria-expanded`, `aria-selected`), and properties only to supplement native HTML when native tags fall short. | WCAG 4.1.2 |
| A11Y06 | Accessible Feedback & Live Updates | Announce dynamic content updates, status alerts, and error feedback using appropriate live regions (`aria-live`) or status roles. | WCAG 3.3.1, 4.1.3 |
| A11Y07 | Pointer, Dragging & Target Size | Ensure touch/pointer targets meet minimum size requirements, offer single-pointer alternatives for dragging, and avoid color-only cues. | WCAG 1.4.1, 2.5.7, 2.5.8 |
| A11Y08 | Responsive Reflow & Contrast | Support 200%+ text zoom, reflow without content loss or 2D scrolling, and maintain sufficient contrast (verifiable statically or dynamically). | WCAG 1.4.3, 1.4.4, 1.4.10 |

## 3. Development Guidance

- **Native HTML First**: Use `<button>` for actions and `<a href>` for navigation. Avoid `<div onclick>` or redundant ARIA roles (e.g. `<button role="button">`).
- **Form Labeling & Descriptions**: Associate inputs with explicit `<label for="...">` or `aria-labelledby`. Use `aria-describedby` when linking supplementary hints or error messages.
- **Native Dialogs & Overlays**: Prefer native HTML `<dialog>` and `.showModal()`, which natively handle `role="dialog"` and focus trapping; use custom focus trapping only for non-native overlays.
- **Text Alternatives**: Provide descriptive `alt` text for informative images; set `alt=""` or `aria-hidden="true"` for decorative graphics.
- **Pointer & Focus**: Ensure touch targets meet minimum sizing (24x24px / 44x44px per spec) and provide non-dragging controls for pointer interactions.

## 4. Review Checks & Evidence Requirements

- **Evidence Requirement**: Before reporting a finding, cite: (1) exact file path and line number, (2) target code snippet, (3) applicable WCAG 2.2 criterion, and (4) concrete evidence of non-compliance.
- **Unlabeled Controls**: Flag interactive elements or form controls missing text content, `<label>`, or accessible name attributes.
- **Inaccessible Custom Controls**: Flag custom interactive elements ONLY when implementation evidence confirms they lack keyboard operability, focusability, or event delegation.
- **Inaccessible Dialogs**: Flag overlays lacking accessible names, focus placement/restoration, or modal dismissal (note: native `<dialog>` handles role and focus natively).

## 5. Common Anti-Patterns

- **Div-Button Pattern**: `<div onclick="...">` used for interactive triggers without semantic button behavior or keyboard support.
- **Missing Form Identification**: `<input>` relying solely on `placeholder` attributes instead of accessible labels.
- **Redundant ARIA Attributes**: Adding `role="navigation"` to `<nav>` or `role="button"` to `<button>`.
- **Obscured Focus**: Custom sticky headers or fixed footers covering keyboard focus indicators during navigation.

## 6. False-Positive Safeguards

Do NOT flag:
- Custom components that delegate events, wrap native controls, or manage keyboard interactions programmatically.
- Native HTML tags (including `<dialog>`, `<nav>`, `<button>`) for missing explicit ARIA roles or custom focus traps.
- Decorative images correctly configured with `alt=""` or `aria-hidden="true"`.
- Missing `aria-describedby` on form fields when accessible labels or error association are handled through equivalent accessible patterns.
- Non-sequential heading level skips if structural sectioning remains logical.
- Color contrast ratio, focus ring visibility, or screen-reader announcements that cannot be conclusively verified without computed CSS or browser runtime evaluation.

## 7. Development & Review Checklist

- [ ] Used native semantic HTML (`<button>`, `<a href>`, `<main>`, `<dialog>`, `<label>`) over custom divs or redundant ARIA?
- [ ] Ensured all form inputs and interactive elements have explicit accessible names?
- [ ] Verified complete keyboard operability, unobscured visible focus, and modal focus management?
- [ ] Validated minimum touch target sizes, single-pointer drag alternatives, and responsive 200% zoom reflow?
