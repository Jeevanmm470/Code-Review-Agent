---
name: skill-ui-tailwind-css
description: >-
  Activate ONLY when developing or reviewing Tailwind CSS code involving utility classes, responsive/state variants,
  v3/v4 configuration, custom theme tokens, @apply/directives, class merging, or source scanning/CSS build issues.
  Do NOT activate for vanilla CSS/Sass without Tailwind or general CSS layout rules (managed by skill-ui-css-standards).
---

# Tailwind CSS Framework Technology Skill

## 1. Purpose & Activation

Provides technology-specific technical guidance for Tailwind CSS utility composition, theme extensions, version-aware v3/v4 configuration, state/responsive variants, dynamic class scanning, and build performance during development and code review.

**Activate ONLY when** code changes involve Tailwind utility classes (`flex`, `p-4`, `hover:bg-blue-500`), Tailwind configuration (`tailwind.config.js`, `@theme`, `@utility`), directives (`@apply`, `@import "tailwindcss"`), `tailwind-merge`, or Tailwind build scanning.

**Do NOT activate for** general CSS standards (`skill-ui-css-standards`), visual style guide consistency (`skill-ui-style-guide-core`), HTML accessibility (`skill-ui-html-accessibility`), or general browser performance (`skill-ui-performance-optimization`).

## 2. Core Rules Summary

| ID | Rule | Scope & Objective |
|---|---|---|
| TW01 | Utility Composition & Class Conflict | Avoid unvarianted conflicting utilities that cause unintended styling behavior; evaluate class precedence using actual generated CSS semantics. |
| TW02 | Version-Aware Config & Directives | Respect installed Tailwind version conventions: v3 JS config (`tailwind.config.js`) vs v4 CSS-first config (`@theme` / `@import`), including v4 `@config` JS loading. |
| TW03 | Theme Tokens & Extension | Extend theme scales (colors, spacing, typography) via config/`@theme` for reusable tokens while supporting valid arbitrary values for one-off layouts. |
| TW04 | Responsive & State Variants | Apply mobile-first responsive breakpoints (`sm:`, `md:`) and state variants (`hover:`, `focus:`, `group-hover:`, `peer-*`). |
| TW05 | Static Class Discovery & Scanning | Ensure utility class candidates are discoverable by Tailwind's source scanner through complete static strings, maps, or safelisting. |
| TW06 | Class Merging & Conditional Composition | Compose conditional utility classes cleanly using `tailwind-merge`, `clsx`, static maps, or mutually exclusive conditional logic. |
| TW07 | Directives, Custom Utilities & @apply | Use `@apply`, `@utility`, and custom directives according to installed version limits without recreating utility bloat. |
| TW08 | Source Detection & Build Performance | Configure `content`/`source` paths accurately to generate lean production stylesheets without scanning build artifacts. |

## 3. Development Guidance

- **Utility Composition**: Combine utilities predictably. Distinguish intentional overrides from conflicts, resolving collisions using `tailwind-merge`, static class maps, or mutually exclusive conditionals.
- **Version Compatibility**: Check `package.json` for Tailwind v3 vs v4. Support v3 JS config, v4 CSS `@theme`, and v4 `@config` directives loading JS configs. Verify directive/plugin compatibility.
- **Static Class Discovery**: Ensure utility names are discoverable by Tailwind source scanning using complete static strings, object maps, or safelisting rather than unmapped dynamic interpolation.
- **Variants & Mobile-First**: Build responsive layouts mobile-first (`p-2 md:p-4`). Use `group-hover:` / `peer-checked:` for parent/sibling state styling.
- **Theme Scaling**: Define reusable tokens in theme config / `@theme`. Use arbitrary values (`top-[117px]`, `grid-cols-[1fr_2fr]`) for one-off design exceptions.

## 4. Review Checks & Evidence Requirements

- **Evidence Requirement**: Cite: (1) exact file path and line number, (2) installed Tailwind version from `package.json`, (3) configuration context (v3 JS, v4 `@theme`, or `@config`), (4) applicable TW rule, (5) concrete styling/build failure, and (6) existing safeguards.
- **Dynamic Class Interpolation**: Flag string interpolation constructing partial class names (e.g., `text-${color}-500`) only when resulting in missing generated utilities or unmapped candidates.
- **Conflicting Utility Override**: Flag unvarianted conflicting utilities on the same element only when producing non-deterministic or unintended styling behavior.
- **Version Config Mismatch**: Flag directive or plugin usage incompatible with the installed Tailwind version (recognizing valid `@config` loading in v4 setups).

## 5. Common Anti-Patterns

- **Unmapped Dynamic Utility Construction**: Assembling utility names dynamically via string concatenation without static mapping, causing missing styles in production.
- **Unresolved Conflicting Classes**: Combining conflicting base utilities on an element without `tailwind-merge`, static maps, or variant conditions when precedence fails.
- **Version Config Paradigm Mismatch**: Applying incompatible directives or plugins for the installed Tailwind version without checking v3/v4 documentation.
- **Arbitrary Scale Abuse**: Repeating identical arbitrary values for core design concepts instead of defining reusable theme tokens.

## 6. False-Positive Safeguards

Do NOT flag:
- Multiple utilities targeting the same CSS property when used as intentional overrides, variant combinations (`md:p-4 p-2`), or conditional states.
- JavaScript configuration files in Tailwind v4 projects legitimately loaded via `@config`.
- Dynamically constructed class names whose complete utility candidates are independently discoverable, safelisted, or included in build output.
- Conditional class composition using `clsx`, `classnames`, or static class maps without `tailwind-merge` when precedence is resolved.
- Valid arbitrary values (`top-[117px]`, `grid-cols-[1fr_2fr]`) required by design specifications.
- Long lists of valid utility classes unless repository-specific ordering tooling (e.g., `prettier-plugin-tailwindcss`) is configured and violated.

## 7. Development & Review Checklist

- [ ] Confirmed installed Tailwind version (v3 vs v4) from `package.json` and matched configuration syntax?
- [ ] Ensured utility class names are discoverable by Tailwind source scanning (via complete static strings, maps, or safelists)?
- [ ] Resolved conditional utility precedence using `tailwind-merge`, `clsx`, or static class maps?
- [ ] Structured responsive layouts mobile-first (`base md:variant`) and leveraged state variants (`hover:`, `group-*`)?
- [ ] Extended theme configuration for repeated custom design tokens instead of repeating arbitrary values?
