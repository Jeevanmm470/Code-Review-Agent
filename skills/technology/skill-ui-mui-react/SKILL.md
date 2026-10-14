---
name: skill-ui-mui-react
description: >-
  Activate ONLY when developing or reviewing Material UI (MUI) code involving @mui/material components, MUI theme configuration,
  sx / styled() styling, responsive breakpoints, form component contracts, MUI accessibility/interaction, SSR Emotion integration, or MUI version/package compatibility.
  Do NOT activate for plain React components without MUI, vanilla CSS/Tailwind, or general React hooks/lifecycle (managed by React skill).
---

# Material UI (MUI) React Technology Skill

## 1. Purpose & Activation

Provides technology-specific technical guidance for Material UI (MUI) component selection, composition, theme customization, styling mechanisms (`sx`, `styled()`), responsive layout utilities, form component contracts, accessibility interactions, SSR Emotion integration, and version compatibility (MUI v5/v6/v7+, MUI X) during development and code review.

**Activate ONLY when** code changes involve `@mui/material`, `@mui/system`, `@mui/lab`, `@mui/x-*`, `ThemeProvider`, `createTheme`, `sx` prop with MUI theme tokens, `styled()` from `@mui/material/styles`, or MUI SSR Emotion setup.

**Do NOT activate for** general React rules (managed by React skill), general component architecture (`skill-ui-component-patterns`), visual design system rules (`skill-ui-style-guide-core`), general CSS layout (`skill-ui-css-standards`), HTML accessibility (`skill-ui-html-accessibility`), or Next.js core routing (`skill-ui-nextjs`).

## 2. Core Rules Summary

| ID | Rule | Scope & Objective |
|---|---|---|
| MUI01 | Component APIs & Composition | Select appropriate `@mui/material` components and props; use `slots`/`slotProps` or legacy `components`/`componentsProps` matching installed version contracts. |
| MUI02 | Theme Configuration & Tokens | Define and consume theme tokens via `createTheme` and `ThemeProvider`; manage palette, typography, spacing, breakpoints, and component default overrides/variants. |
| MUI03 | Styling Mechanisms & `sx` | Apply `sx`, `styled()`, or `styleOverrides` cleanly using theme tokens (`color: 'primary.main'`, `p: 2`) without broken specificity or arbitrary overrides. |
| MUI04 | Responsive Layout & Breakpoints | Construct responsive layouts using MUI breakpoint syntax in `sx` or `Grid`/`Stack`/`Box`; account for version Grid differences (`Grid`, `Grid2`, `Unstable_Grid2`) and SSR `useMediaQuery`. |
| MUI05 | Form Component Contracts | Maintain valid controlled/uncontrolled state contracts for `TextField`, `Select`, `Autocomplete` (`value`/`inputValue`), and inputs; integrate error/helperText cleanly. |
| MUI06 | Component Accessibility & Interaction | Preserve built-in MUI accessibility (Dialog, Menu, Tooltip focus/keyboard management) and provide explicit labels, ARIA attributes, and accessible roles. |
| MUI07 | SSR, Hydration & Styling Engine | Configure Emotion cache insertion order, server-side style generation (`AppRouterCacheProvider` or custom EmotionCache), and theme hydration without style flicker. |
| MUI08 | Version & Package Compatibility | Detect installed `@mui/material` version (v5/v6/v7+) and separate MUI X packages (`@mui/x-data-grid`, `@mui/x-date-pickers`), respecting API changes and package boundaries. |

## 3. Development Guidance

- **Component Selection & Slots**: Leverage native MUI component props and polymorphic `component` prop. Support `slots`/`slotProps` alongside supported legacy `components`/`componentsProps` for installed version. Do not flag deprecated props as defects unless required by migration target.
- **Theme & Styling APIs**: Centralize design tokens in `createTheme()`. Support `sx`, `styled()`, `styleOverrides`, CSS Modules, or custom values without mandating theme tokens for every style value unless project conventions require it.
- **Responsive Layouts**: Use responsive `sx` objects (`{ width: { xs: '100%', md: '50%' } }`). Verify `Grid`, `Grid2`, or `Unstable_Grid2` imports against exact installed version. Use `noSsr: true` or default options for `useMediaQuery` in SSR contexts.
- **Form Component Contracts**: Maintain valid controlled (`value` + `onChange`) or uncontrolled (`defaultValue`) state. Treat `value` and `inputValue` on `Autocomplete` as distinct states. Support external form library bindings (React Hook Form, Formik).
- **Accessibility & Interaction**: Preserve built-in focus trapping and keyboard navigation in `Dialog`, `Popover`, and `Menu`. Provide `aria-label`, `aria-labelledby`, or `id`/`htmlFor` associations on inputs, buttons, and custom controls.
- **SSR & Styling Engine**: Support `@mui/material-nextjs` (`AppRouterCacheProvider`), custom Emotion Cache with prepend injection, or alternative supported style engines in Next.js (App/Pages router) and SSR setups.

## 4. Review Checks & Evidence Requirements

- **Evidence Requirement**: Cite: (1) exact file path and line number, (2) installed `@mui/material` and package versions from `package.json`, (3) component API contract and rendering context, (4) applicable MUI rule, (5) concrete MUI API or rendering issue, and (6) existing safeguards.
- **Controlled/Uncontrolled Mismatch**: Flag passing `undefined` to controlled MUI inputs (`TextField`, `Select`, `Autocomplete`) only when causing runtime React warnings, state resetting, or invalid control transitions.
- **Grid Version Incompatibility**: Flag importing unsupported Grid sub-packages or props incompatible with the exact installed MUI version (verifying `Grid`, `Grid2`, or `Unstable_Grid2` support).
- **SSR Emotion Hydration Defect**: Flag SSR / Next.js styling defects only when concrete evidence demonstrates unstyled content, class mismatches, or missing style insertion hooks.

## 5. Common Anti-Patterns

- **Uncontrolled-to-Controlled State Reset**: Transitioning controlled inputs between `undefined` and defined string values, triggering React component state warnings.
- **Incompatible Grid Prop Blending**: Combining legacy MUI v4/v5 Grid props (`item`, `xs={12}`) with MUI v6 Grid2 APIs (`size={{ xs: 12 }}`), breaking layout structure.
- **Accessibility Traps via Overrides**: Disabling focus trap or keydown listeners on `Dialog` or `Modal` without providing alternative accessible keyboard navigation.
- **Version-Incompatible Directive/Prop Imports**: Referencing component props or sub-package paths unsupported by the installed `@mui/material` version.

## 6. False-Positive Safeguards

Do NOT flag:
- Deprecated or legacy MUI props (`components`, `componentsProps`) when functional in the installed MUI version and no migration policy applies.
- Version-supported Grid implementations (`Grid`, `Grid2`, `Unstable_Grid2`) matching the installed `@mui/material` or `@mui/system` version.
- Valid usage of inline `sx`, `styled()`, raw CSS, CSS Modules, or custom non-theme style values.
- `Autocomplete` controlled state using separate `value` and `inputValue` properties or `undefined` states handled safely by component logic or form libraries.
- Custom Emotion cache setups or SSR configurations lacking `AppRouterCacheProvider` without evidence of hydration failure or style flicker.
- MUI X components (`DataGrid`, `DatePicker`) having distinct component prop contracts from core `@mui/material` components.
- Controlled inputs initialized with non-null empty states (e.g. `''` or `[]`).

## 7. Development & Review Checklist

- [ ] Confirmed installed `@mui/material` version (v5/v6/v7+) and used corresponding component APIs, slot patterns, and Grid imports?
- [ ] Centralized custom tokens in `createTheme` while permitting valid custom or component-level style overrides?
- [ ] Maintained proper controlled (`value` + `onChange`) or uncontrolled state contracts without invalid value drift or warnings?
- [ ] Preserved built-in accessibility semantics and provided accessible labels/IDs for interactive components?
- [ ] Verified Emotion Cache or SSR style generation setup without assuming a single universal cache provider pattern?
