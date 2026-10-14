---
name: skill-ui-component-patterns
description: >-
  Activate ONLY when authoring or reviewing UI component definitions, component composition, public component APIs,
  state ownership, lifecycle behavior, or component interaction patterns.
  Do NOT activate for standalone CSS styling, design tokens, HTML semantics, API endpoints, or backend logic.
---

# UI Component Patterns Engineering Skill

## 1. Purpose & Activation

Provides framework-independent UI component engineering standards for development and code review.

**Activate ONLY when** code changes touch UI component definitions, component APIs (props/events), composition structures, state ownership, lifecycle hooks, or component interaction states.

**Do NOT activate for** design token policy (`skill-ui-style-guide-core`), HTML accessibility (`skill-ui-html-accessibility`), CSS implementation (`skill-ui-css-standards`), API integration, or backend logic.

## 2. Core Rules Summary

| ID | Rule | Scope & Objective |
|---|---|---|
| COMP01 | Cohesive Component Boundaries | Define explicit component responsibilities and public interfaces; avoid mixing unrelated UI concerns. |
| COMP02 | Composition Over Premature Abstraction | Prefer composition and variant slots over deep inheritance or premature abstraction for one-off UI. |
| COMP03 | Explicit & Immutable Data Contracts | Define explicit inputs, outputs, and event contracts; treat incoming data as immutable. |
| COMP04 | Single-Source State Ownership | Keep state at its minimal ownership level; calculate derived values on-the-fly to prevent desynchronization. |
| COMP05 | Complete Component State Coverage | Explicitly handle all necessary interaction variants: loading, empty, success, error, and disabled states. |
| COMP06 | Lifecycle & Resource Cleanup | Dispose of timers, global listeners, and subscriptions upon component destruction to prevent memory leaks. |
| COMP07 | Predictable Event & Callback Flow | Emit explicit event payloads; avoid stale callbacks, unexpected side effects, or parent mutation. |
| COMP08 | Configurable Extensibility | Support extension points and configurable props without inflating internal conditional branching. |

## 3. Development Guidance

- **Public Interface Design**: Keep component contracts minimal and explicit. Document expected inputs, callbacks, and default behaviors.
- **Composition First**: Build complex views by combining small, focused sub-components via children/slots rather than giant monolith props.
- **State Ownership**: Place state closest to where it is consumed. Calculate derived values dynamically instead of synchronizing duplicated state.
- **Visual State Completeness**: Ensure UI components gracefully represent empty data, pending asynchronous operations, and error states.
- **Lifecycle Safety**: Pair any subscription, timer, or event listener creation with explicit teardown/cleanup logic.

## 4. Review Checks & Evidence Requirements

- **Evidence Requirement**: Before reporting a finding, cite: (1) exact file path and line number, (2) target component/contract, (3) applicable rule, and (4) concrete evidence of state desync, contract breakage, or unhandled side effect.
- **Direct Input Mutation**: Flag components that directly mutate incoming props or parent-owned data structures.
- **Duplicated Synchronized State**: Flag local state properties kept in manual sync with parent state when derived calculation suffices.
- **Missing Lifecycle Cleanup**: Flag event listeners, timers, or subscriptions initialized in components without teardown logic.

## 5. Common Anti-Patterns

- **Props Mutation**: Reassigning or mutating incoming component arguments/properties directly.
- **State Mirroring**: Copying prop values into local state and attempting manual sync, causing desynchronization bugs.
- **Boolean Prop Explosion**: Adding dozens of boolean flag props (`isHeader`, `isSidebar`, `isCompact`) instead of distinct variants/composition.
- **Dangling Subscriptions**: Registering global window/document event listeners without cleanup upon component destruction.

## 6. False-Positive Safeguards

Do NOT flag:
- Larger component file size when managing a single cohesive UI feature.
- Local component state when shared/global state is unnecessary.
- Shared/lifted state when multiple consumers genuinely require synchronized data access.
- Prop drilling across 2-3 levels without demonstrated maintenance or performance issues.
- One-off component duplication when creating a shared abstraction adds net complexity.
- Framework-managed automatic lifecycle cleanup or reactivity.

## 7. Development & Review Checklist

- [ ] Defined clear, explicit component interfaces without mutating incoming parent data?
- [ ] Preferred composition over premature abstraction or boolean prop explosion?
- [ ] Owned state at the appropriate level and derived calculated values dynamically?
- [ ] Handled relevant visual interaction states (loading, empty, error, disabled)?
- [ ] Guaranteed complete cleanup of timers, event listeners, and subscriptions?

