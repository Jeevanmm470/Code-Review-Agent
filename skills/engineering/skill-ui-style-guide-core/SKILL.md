---
name: skill-ui-style-guide-core
description: >-
  Activate ONLY when authoring or reviewing UI styling, design tokens, theme definitions,
  typography scales, spacing layouts, or visual component styling. Do NOT activate for
  business logic, API calls, state management, or event handlers.
---

# UI Style Guide Core Engineering Skill

## 1. Purpose & Activation

Provides framework-independent design-system guidance for UI styling development and code review.

**Activate ONLY when** code changes modify visual styles, CSS/styling declarations, design tokens, theme definitions, typography, spacing layouts, or `DESIGN.md` integration.

**Do NOT activate for** non-visual UI logic, API integration, state management, or event handling.

## 2. Core Rules Summary

| ID | Rule | Scope & Objective |
|---|---|---|
| STYLE01 | Token First | Prefer existing semantic design tokens (color, spacing, typography, radius, shadow) over raw hardcoded values. |
| STYLE02 | Token Reuse & Extension | Reuse existing system tokens before creating new ones; extend token scales systematically in central files. |
| STYLE03 | Theme Compatibility | Use theme tokens for multi-theme support (e.g. light/dark) when required by project design specs. |
| STYLE04 | Visual Consistency | Maintain uniform spacing, typography hierarchies, and visual affordances across component variants. |
| STYLE05 | Responsive & Fluid Scaling | Apply project-defined responsive scales, fluid tokens, or media queries; avoid uncoordinated ad-hoc overrides. |
| STYLE06 | Design System Contract | Align styling implementation with repository `DESIGN.md`, token manifests, or project design specs. |

## 3. Development Guidance

- **Inspect Token Specs**: Check `DESIGN.md` or token manifests before adding custom CSS rules.
- **Reuse Over Redefining**: Reference established tokens (e.g., `var(--color-primary)`, `var(--spacing-md)`) instead of raw values.
- **Centralized Extensions**: Declare new tokens in central theme/token files when design specs introduce new primitives.
- **Contextual Theming**: Use theme variables only when the project explicitly supports multi-theme configurations.

## 4. Review Checks & Evidence Requirements

- **Evidence Requirement**: Before reporting a finding, specify: (1) exact file path and line number, (2) target code declaration, (3) applicable design system token/rule, and (4) exact reason for non-compliance.
- **Unjustified Hardcoded Values**: Flag raw visual values (hex colors, arbitrary pixel paddings) ONLY when an equivalent semantic token exists.
- **Inconsistent Token Usage**: Flag mixing token abstraction tiers (e.g., raw palette `--blue-500` used directly instead of semantic `--color-primary`).

## 5. Common Anti-Patterns

- **Primitive Token Direct Use**: Bypassing semantic tokens to reference raw palette tokens directly.
- **Redundant Token Declarations**: Declaring local CSS variables that duplicate existing repository design tokens.
- **Uncoordinated Overrides**: Applying ad-hoc inline pixel offsets (`margin-top: 7px`) that violate the project spacing scale.

## 6. False-Positive Safeguards

Do NOT flag:
- Raw visual values defined inside central design token files or theme config manifests.
- Documented component-specific styling exceptions or micro-adjustments in `DESIGN.md`.
- Third-party widget integrations or vendor-mandated pixel dimensions.
- Dynamic runtime-calculated layout positions (e.g., drag-and-drop, canvas offsets).
- Valid CSS units (`px`, `rem`, `em`, `%`, `vh`) unless explicitly restricted by project guidelines.

## 7. Development & Review Checklist

- [ ] Reused existing semantic design tokens for visual properties?
- [ ] Adhered to project-supported theme configurations (if multi-theme enabled)?
- [ ] Applied project-defined responsive scaling or media queries appropriately?
- [ ] Verified custom styles against repository `DESIGN.md` or token specifications?
