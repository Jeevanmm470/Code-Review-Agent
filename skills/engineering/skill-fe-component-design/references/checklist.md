# Frontend Component Design Inspection Checklist

This checklist defines review criteria, detection heuristics, evidence patterns, anti-patterns, remediation strategies, and default severities for rules `FCD01` through `FCD10`.

---

## FCD01: Single Responsibility & Cohesion

- **Purpose:** Eliminate god components that combine unrelated responsibilities (e.g. form management, API orchestration, business calculations, analytics, and complex presentation) into a single unmaintainable unit.
- **Detect:**
  - A component containing multiple independent workflows where a change to one workflow risks breaking others.
  - Components with distinct lifecycle triggers, multiple disparate network calls, and sprawling JSX templates.
  - Substantial duplicated decision logic for unrelated UI sections inside a single component file.
- **Evidence:**
  - `UserProfileCard` fetching billing data, calculating tax brackets, handling credit card tokenization, and rendering friendship social feeds.
  - Multi-feature components requiring frequent modifications for unrelated feature tickets.
- **Avoid:**
  - Flagging components that manage multiple tightly related fields within a single unified form workflow.
- **Remediation:**
  - Extract sub-features into dedicated focused components or container/presenter pairs.
  - Delegate data fetching and business calculations to custom hooks or service modules.
- **Severity:** High

---

## FCD02: Separation of Concerns & Layering

- **Purpose:** Prevent business logic, domain transformations, and raw data access from being embedded directly inside UI rendering trees.
- **Detect:**
  - Complex mathematical, financial, or domain rule calculations written inline inside JSX/template rendering expressions.
  - Direct HTTP calls, database client queries, or `localStorage` reads placed directly inside click handlers rather than abstracted service layers.
  - Mixing UI layout styling concerns with core domain entity validation logic.
- **Evidence:**
  - Rendering expression: `{items.filter(i => (i.price * (1 - i.discountRate)) > threshold && calculateInterest(i.taxTier)).map(...)}`.
  - Component invoking raw `fetch` directly inside inline `onClick` handlers across 10 different buttons.
- **Avoid:**
  - Flagging trivial presentation formatting (e.g. `user.firstName + ' ' + user.lastName`, string capitalization, or simple boolean flags).
- **Remediation:**
  - Move domain calculations to pure helper functions or custom domain hooks.
  - Abstract API calls behind dedicated service methods or query hooks.
- **Severity:** High

---

## FCD03: Component Coupling & Encapsulation

- **Purpose:** Prevent parent components from directly accessing or mutating child internals and avoid circular component dependencies.
- **Detect:**
  - Parent components reaching into child refs to mutate internal state variables directly (`childRef.current.state.value = 123` or calling child private methods).
  - Components relying on undocumented side effects or private DOM structures of sibling/child components.
  - Circular imports between parent and child component files.
- **Evidence:**
  - Parent calling `childRef.current.internalState.reset()` instead of passing controlled props or triggering explicit interface callbacks.
  - Sibling component directly querying and mutating DOM nodes managed by another component (`document.querySelector('.child-modal').classList.add(...)`).
- **Avoid:**
  - Flagging standard imperative handles (`useImperativeHandle`, `focus()`, `scrollTo()`) designed as explicit public APIs for DOM interactions.
- **Remediation:**
  - Transform components into controlled components driven by props and callback events.
  - Encapsulate child state and expose clean, explicit callback contracts.
- **Severity:** High

---

## FCD04: Props, Inputs & Interface Contracts

- **Purpose:** Eliminate confusing boolean mode flags, excessive unrelated props, and ambiguous callback signatures that make component reuse risky and error-prone.
- **Detect:**
  - Components accepting multiple conflicting boolean flags (e.g. `isCompact`, `isFullWidth`, `isSidebar`, `isModal`, `isHero`) that create impossible layout combinations.
  - Props whose semantics change unexpectedly depending on the value of an unrelated prop.
  - Giant prop lists where only 2-3 props are used per rendering mode.
- **Evidence:**
  - `<Button isPrimary isSecondary isLink isIconOnly />` where combination results in undefined styling behavior.
  - Component interface requiring 25 optional props where only disjoint subsets are valid together.
- **Avoid:**
  - Flagging cohesive component property bags (e.g. a typed `user: UserProfile` object or standard HTML element prop extensions).
- **Remediation:**
  - Replace conflicting boolean flags with an explicit enum or union type variant (e.g. `variant: 'primary' | 'secondary' | 'link'`).
  - Split multi-mode components into distinct specialized components sharing a common base.
- **Severity:** Medium

---

## FCD05: Composition & Hierarchy Depth

- **Purpose:** Replace brittle deep prop-drilling and redundant wrapper layers with clear slot/children composition.
- **Detect:**
  - Passing props through 5+ intermediate component layers that do not use the data, only forwarding it to a deeply nested leaf component.
  - Deeply nested hierarchies of single-responsibility wrappers that create unnecessary DOM node bloat and tracing friction.
  - Components that force consumers to configure all nested sub-elements via rigid prop arrays rather than component slots/children.
- **Evidence:**
  - `Page -> Content -> Layout -> Section -> CardList -> CardItem -> Avatar` forwarding `onAvatarClick` through every level without using it.
  - `<Table columns={[...]} customHeaderRenderer={...} customFooterRenderer={...} customEmptyRenderer={...} />` where slot composition would simplify consumer usage.
- **Avoid:**
  - Flagging shallow 1-2 level prop forwarding or well-structured context providers.
- **Remediation:**
  - Use component composition (`children`, `<slot />`, compound components) so parents can pass leaf components directly.
  - Utilize React Context, Angular services, or Vue `provide/inject` for truly ambient cross-cutting concerns (e.g. auth, theme).
- **Severity:** Medium

---

## FCD06: Abstraction Leaks & Special-Casing

- **Purpose:** Prevent reusable UI primitives from accumulating feature-specific conditional hacks and domain branches that break generic contracts.
- **Detect:**
  - Shared design system components (e.g. `Button`, `Modal`, `DataTable`) containing `if (props.featureName === 'checkout')` hardcoded special cases.
  - Generic components importing domain-specific models, icons, or endpoints from a specific feature module.
  - Leaking feature-specific CSS classes or hardcoded route URLs inside generic UI primitives.
- **Evidence:**
  - Inside `BaseCard.tsx`: `if (props.isFromMarketingPage) { return <MarketingCardHeader />; }`.
  - Design system `Input` component importing `import { validateVatNumber } from '@/features/billing'`.
- **Avoid:**
  - Flagging feature-specific composite components built on top of generic primitives.
- **Remediation:**
  - Invert control by accepting slot/children render elements or generic callback handlers.
  - Keep generic primitives pure and build feature-specific composite components in feature folders.
- **Severity:** High

---

## FCD07: Duplicated Logic & Synchronization

- **Purpose:** Consolidate identical business validation rules or UI workflows duplicated across multiple sibling components that must remain synchronized.
- **Detect:**
  - Sibling components implementing identical complex input validation, permission checking, or pricing discount logic.
  - Copy-pasted multi-step modal workflows across different views with subtle diverging bugs.
- **Evidence:**
  - 3 different checkout components maintaining separate, divergent copies of credit card Luhn algorithm validation logic.
  - Duplicated order cancellation confirmation workflow implemented in both `OrderList` and `OrderDetail` components.
- **Avoid:**
  - Flagging coincidental markup similarity or simple presentation duplication that does not share domain rules.
- **Remediation:**
  - Extract common domain rules and workflows into shared custom hooks, utility functions, or reusable compound components.
- **Severity:** Medium

---

## FCD08: Side-Effect Separation & Lifecycle

- **Purpose:** Prevent components from interleaving unrelated side effects (timers, subscriptions, metrics, browser DOM listeners) with core rendering.
- **Detect:**
  - Component lifecycle hooks (`useEffect`, `onMounted`) bundling 5 unrelated side effects (analytics tracking, websocket connection, scroll listener, audio playback) into a single callback.
  - Direct DOM mutation or external API calls executing directly inside render functions instead of structured lifecycle hooks.
- **Evidence:**
  - Single `useEffect` with 40 lines setting up 3 unrelated event listeners, fetching user profile, and triggering analytics telemetry.
  - Component body mutating `document.title` or `window.localStorage` synchronously during render evaluation.
- **Avoid:**
  - Flagging small, cohesive side effects directly required for component layout synchronization (e.g. focus management).
- **Remediation:**
  - Split multi-purpose lifecycle hooks into focused, single-purpose hooks.
  - Extract complex third-party subscriptions or analytics bindings into dedicated custom hooks (`useAnalytics`, `useWebSocket`).
- **Severity:** Medium

---

## FCD09: Component Testability & Isolation

- **Purpose:** Decouple untestable hidden dependencies and complex render-bound logic to enable isolated unit testing.
- **Detect:**
  - Components that instantiate global singletons, unmockable browser APIs (`window.location.href = ...`), or direct WebSocket connections inside render flow, making isolated test rendering impossible.
  - Complex branching algorithms trapped inside component templates that cannot be exercised without rendering the entire UI tree.
- **Evidence:**
  - Component hardcoding `window.location.reload()` or direct singleton API instances that prevent test runners from executing unit assertions.
  - 100-line tax deduction algorithm embedded in a button click handler with no exported testable function.
- **Avoid:**
  - Flagging standard hook usages or framework dependency injection systems that provide mockable interfaces.
- **Remediation:**
  - Extract pure algorithmic logic to standalone testable helper functions.
  - Inject external dependencies (navigation, storage) via props, context, or framework DI.
- **Severity:** High

---

## FCD10: Domain Ownership & Consistency

- **Purpose:** Ensure domain entities and state mutations have a clear owning component or dedicated domain service hook, preventing fragmented domain state across the component tree.
- **Detect:**
  - Sibling components updating the same domain entity through competing, uncoordinated mutation pathways.
  - Presentation components making unauthorized direct mutations to shared domain models.
- **Evidence:**
  - Cart item count being incremented independently by `ProductGrid`, `HeaderCartIcon`, and `QuickBuyModal` without a single authoritative cart domain owner.
- **Avoid:**
  - Flagging components that dispatch domain events or actions to a centralized state store.
- **Remediation:**
  - Establish a single owning container component or dedicated domain service hook to coordinate entity mutations.
- **Severity:** High

