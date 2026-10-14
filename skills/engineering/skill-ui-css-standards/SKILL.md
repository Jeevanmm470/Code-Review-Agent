---
name: skill-ui-css-standards
description: >-
  Activate ONLY when authoring or reviewing CSS stylesheets, style declarations, selectors, layout systems,
  media/container queries, custom properties, or CSS transitions. Do NOT activate for design token policies,
  HTML accessibility rules, API integration, or non-visual logic.
---

# UI CSS Standards Engineering Skill

## 1. Purpose & Activation

Provides framework-independent CSS engineering standards for UI development and code review.

**Activate ONLY when** code changes modify CSS files, style declarations, selectors, layout systems (Flexbox/Grid), responsive queries, CSS custom properties, or visual interaction states.

**Do NOT activate for** design token policy (`skill-ui-style-guide-core`), HTML accessibility (`skill-ui-html-accessibility`), API integration, backend services, or non-visual business logic.

## 2. Core Rules Summary

| ID | Rule | Scope & Objective |
|---|---|---|
| CSS01 | Scoped Architecture | Scope component styles via CSS Modules, scoping attributes, Shadow DOM, or naming conventions to prevent style leakage. |
| CSS02 | Specificity & Cascade Control | Maintain predictable specificity; use `:where()`, `@layer`, or nesting cleanly to prevent unintended cascade conflicts or fragile DOM coupling. |
| CSS03 | Flexible Layouts & Stacking | Use Flexbox, Grid, or positioned flow appropriately; manage z-index stacking contexts intentionally. |
| CSS04 | Responsive & Fluid Scaling | Apply media queries, container queries, or fluid functions (`clamp()`, `min()`, `max()`) matching target breakpoints. |
| CSS05 | Contextual Units & Property Scope | Use contextually appropriate units (`px`, `rem`, `em`, `%`, viewport/container units) and scope custom properties with fallbacks. |
| CSS06 | Applicable Interactive States | Implement visual interaction states (`:hover`, `:focus-visible`, `:active`, `:disabled`) applicable to the component's interactive role. |
| CSS07 | Progressive Enhancement | Provide standard CSS fallback properties or `@supports` feature queries when target environment support requires it. |
| CSS08 | Efficient Animations & Transitions | Prefer `transform`/`opacity` for dynamic transitions; evaluate layout animations (`width`, `height`, `margin`) against empirical performance evidence. |

## 3. Development Guidance

- **Scoped Selectors**: Use CSS Modules, BEM prefixes, or scoped attributes for component styles; restrict bare tag rules to reset/base stylesheets.
- **Cascade Management**: Control specificity using `:where()`, `:is()`, or `@layer`. Reserve `!important` for intentional utility or override layers.
- **Modern Layouts**: Select CSS Grid for 2D structures and Flexbox for 1D alignments; avoid fragile positioning where normal flow suffices.
- **Contextual Sizing**: Use `px` for fixed asset/border sizes, `rem`/`em` for scalable elements, and `%`/viewport units for fluid bounds as required by project standards.
- **Performance Awareness**: Prefer compositor-friendly `transform` and `opacity` for frequent transitions; evaluate layout property animations in context.

## 4. Review Checks & Evidence Requirements

- **Evidence Requirement**: Before reporting a CSS finding, verify: (1) exact file path and line number, (2) target selector/declaration, (3) applicable CSS rule or project standard, and (4) concrete evidence of cascade conflict, style leakage, or broken behavior.
- **Unscoped Global Selectors**: Flag generic HTML tag rules in component stylesheets ONLY when they cause global style leakage outside base/reset files.
- **Conflicting Overrides**: Flag `!important` or high-specificity chains ONLY when implementation evidence shows they create unmaintainable cascade conflicts.
- **Brittle Layout Placements**: Flag hardcoded positioning offsets ONLY when they break responsive layout flow or cause element clipping.

## 5. Common Anti-Patterns

- **Global Cascade Contamination**: Styling bare HTML tags inside component files, bleeding styles into parent/sibling scopes.
- **Fragile Selector Chains**: Overly tight DOM coupling (`.card .wrapper .content .text p`) creating unmaintainable specificity locks.
- **Uncontrolled Stacking Contexts**: Arbitrary `z-index: 9999` declarations without a managed stacking layer hierarchy.
- **Unnecessary Reflow Transitions**: Applying frequent transitions to layout-triggering properties without performance justification.

## 6. False-Positive Safeguards

Do NOT flag:
- `!important` used intentionally in utility classes, CSS resets, or third-party override stylesheets.
- Explicit `px` values required for icons, borders, avatars, or design-specified fixed elements.
- Selectors nested beyond 3 levels using native CSS nesting, `:where()`, `:is()`, or scoped component tooling.
- Missing pseudo-classes (`:hover`, `:disabled`) on elements where those interaction states are non-applicable or browser-default styled.
- Animations/transitions on layout properties (`width`, `height`) unless empirical performance thrashing is evidenced.
- CSS custom properties, vendor prefixes, or framework-generated styles following repository standards.

## 7. Development & Review Checklist

- [ ] Scoped component styling to prevent global cascade leakage?
- [ ] Kept selector specificity predictable without unmaintainable `!important` conflicts?
- [ ] Used Flexbox/Grid and contextual units (`px`, `rem`, `%`) matching layout requirements?
- [ ] Implemented relevant interaction states for applicable component controls?
- [ ] Applied hardware-accelerated transitions or verified layout property animations?
