# Frontend State Management Inspection Checklist

This checklist defines review criteria, detection heuristics, evidence patterns, anti-patterns, remediation strategies, and default severities for rules `FSM01` through `FSM10`.

---

## FSM01: State Ownership & Duplication Prevention

- **Purpose:** Prevent conflicting sources of truth, unsynchronized prop mirroring, and uncoordinated state copies that diverge over time.
- **Detect:**
  - Copying incoming props directly into local state (`const [data, setData] = useState(props.data)`) without updating when `props.data` changes, leading to stale UI on parent re-renders.
  - Storing the same entity data in multiple independent component states or stores without a synchronization protocol.
  - Duplicating server response data into multiple local component properties that get mutated independently.
- **Evidence:**
  - `useState(props.user)` inside a component where parent updates to `props.user` are ignored because initial state only initializes once.
  - Component A and Component B both managing independent local copies of `selectedItem` without syncing.
- **Avoid:**
  - Flagging intentional form editing drafts where the user explicitly edits a local draft before saving back to the parent.
- **Remediation:**
  - Derive values directly from props/store instead of copying to local state.
  - If a draft state is required, use a `key` prop on the component to reset on entity ID changes, or synchronize via explicit draft reset logic.
- **Severity:** High

---

## FSM02: Derived State & Synchronized Computations

- **Purpose:** Ensure computed or transformed values are calculated on-the-fly rather than cached in redundant state variables that easily become desynchronized.
- **Detect:**
  - Maintaining separate state variables for derived counts, totals, filtered arrays, or validation flags (e.g. `const [fullName, setFullName] = useState('')` updated via effects when `firstName` or `lastName` changes).
  - Using reactive effects or watchers to manually synchronize derived state, creating extra render cycles, layout thrashing, or stale 1-render lag.
  - Circular synchronization dependencies between two reactive properties where update A triggers B, which triggers A.
- **Evidence:**
  - `useEffect(() => { setTotal(items.reduce(...)); }, [items])` storing a redundant `total` state variable.
  - State variable `filteredList` updated via watchers instead of computed properties or inline filtering.
- **Avoid:**
  - Flagging expensive calculations wrapped in memoization primitives (`useMemo`, `computed()`) with correct dependency lists.
- **Remediation:**
  - Compute derived values during render/evaluation: `const fullName = `${firstName} ${lastName}`;`.
  - Wrap computationally expensive derived transformations in memoization hooks (`useMemo(() => items.filter(...), [items])`).
- **Severity:** Medium

---

## FSM03: Async Race Conditions & Sequence Safety

- **Purpose:** Prevent out-of-order asynchronous responses from overwriting newer search, filter, or entity selections when network response order differs from request order.
- **Detect:**
  - Asynchronous fetch triggers (such as search typeahead, tab switching, or pagination clicks) calling `setState(response)` directly without tracking request IDs, timestamps, or using `AbortController`.
  - Component fetching data for `userId` prop where switching users quickly causes the slower previous user fetch to resolve last and display wrong user profile.
  - Missing cancellation or active-request flags when component unmounts or active entity changes.
- **Evidence:**
  - `const handleSearch = async (query) => { const res = await api.search(query); setResults(res); };` lacking request sequence guards.
  - Sequence: User types "A" (Request 1 sent), types "AB" (Request 2 sent), Request 2 finishes (UI displays "AB"), Request 1 finishes (UI incorrectly reverts to "A").
- **Avoid:**
  - Flagging async queries managed by standardized caching/query libraries (e.g. TanStack Query, RTK Query, SWR) that handle request sequencing internally.
- **Remediation:**
  - Use `AbortController` to cancel pending obsolete requests when starting a new query.
  - Use an active request token/counter or `let ignore = false` inside `useEffect` cleanup to discard stale responses.
- **Severity:** High

---

## FSM04: State Transitions & Invariant Integrity

- **Purpose:** Prevent contradictory boolean state combinations and ensure state transitions preserve domain invariants across loading, error, success, and empty states.
- **Detect:**
  - Using multiple independent boolean flags (`isLoading`, `isError`, `isSuccess`, `isEmpty`) that allow invalid states (e.g. `isLoading === true && isError === true`).
  - Transitioning directly from loading to success without clearing previously recorded error states, causing conflicting UI banners.
  - Inconsistent reset logic during form submissions or multi-step wizard flows.
- **Evidence:**
  - `const [loading, setLoading] = useState(false); const [error, setError] = useState(null);` where error banner renders simultaneously with loading spinner.
  - Action handler transitions state to `SAVING` without validating that mandatory form fields are populated.
- **Avoid:**
  - Flagging simple components with mutually exclusive ternary or discriminated union state representations.
- **Remediation:**
  - Use an explicit status enum or union type: `type Status = 'idle' | 'loading' | 'success' | 'error';`.
  - Use a reducer or finite state machine (`useReducer`) to enforce atomic, valid state transitions.
- **Severity:** Medium

---

## FSM05: Shared & Global State Store Isolation

- **Purpose:** Prevent unintended cross-component side effects, tenant/user data contamination, and broken store encapsulation in shared state stores.
- **Detect:**
  - Global singleton stores in server-rendered applications (SSR / Next.js / Nuxt) where state is shared across concurrent incoming user requests.
  - Direct external mutation of store internal state bypassing actions, mutations, or reducer boundaries.
  - Shared state stores that leak sensitive data from previous authenticated users after logout or account switching.
- **Evidence:**
  - Instantiating a global store singleton at module root level in an SSR application: `export const globalUserStore = new UserStore();`.
  - Component directly mutating `store.state.items.push(newItem)` bypassing store action validation.
- **Avoid:**
  - Flagging standard client-side SPA store singletons intended for single-user browser runtimes.
- **Remediation:**
  - In SSR environments, instantiate stores per-request via context providers.
  - Enforce unidirectional data flow; modify store state strictly via defined actions/reducers with deep immutability or encapsulation.
- **Severity:** High

---

## FSM06: Cache Invalidation & Optimistic Rollbacks

- **Purpose:** Ensure failed optimistic mutations revert state cleanly to previous snapshots, and client-side caches maintain consistent cache keys and invalidation policies.
- **Detect:**
  - Performing optimistic UI updates (e.g. instantly marking an item as deleted or liked) without retaining a previous snapshot to roll back upon API error.
  - Rollback logic that overwrites subsequent successful user changes when a prior mutation fails.
  - Cache query keys that omit essential filter, sorting, or pagination parameters, causing cache collisions across different views.
- **Evidence:**
  - `setItems(items.filter(i => i.id !== id)); try { await api.delete(id); } catch { /* missing rollback */ }`.
  - Query cache key `['users']` used for both `getUsers({ page: 1 })` and `getUsers({ page: 2 })`.
- **Avoid:**
  - Flagging non-optimistic mutations where UI waits for server response confirmation before updating state.
- **Remediation:**
  - Store snapshot prior to optimistic update and restore snapshot in `catch` block (`onError: (err, newTodo, context) => setItems(context.previousTodos)`).
  - Include all filtering and pagination parameters in cache query keys: `['users', { page, filter }]`.
- **Severity:** High

---

## FSM07: Persistence Schema & State Restoration

- **Purpose:** Validate persisted state retrieved from browser storage against current schema definitions, prevent stale schema corruption, and ensure clean reset on logout.
- **Detect:**
  - Deserializing state from `localStorage` without validating types, missing fields, or schema version migration, leading to runtime `TypeError: Cannot read properties of undefined`.
  - Retaining persisted user data or cached tokens in storage after user logs out or switches accounts.
  - Overwriting authoritative live server data with stale persisted cache without freshness timestamps.
- **Evidence:**
  - `const savedState = JSON.parse(localStorage.getItem('app_state')!);` without null check or schema version check.
  - App crashes when user opens application after a deployment that changed state property names.
- **Avoid:**
  - Flagging simple persistence of non-breaking UI preferences (e.g. dark mode boolean) with fallback defaults.
- **Remediation:**
  - Implement schema versioning and validation (e.g. Zod / schema migration functions) when loading persisted state.
  - Provide fallback defaults and clear persisted state on version mismatch or logout.
- **Severity:** Medium

---

## FSM08: Lifecycle Subscriptions & Stale Closures

- **Purpose:** Prevent memory leaks, duplicate event processing, and stale closure overwrites in asynchronous callbacks, intervals, and event subscriptions.
- **Detect:**
  - Subscribing to event emitters, WebSockets, RxJS observables, or custom stores inside lifecycle hooks without returning an unsubscribe cleanup function.
  - Asynchronous callbacks or `setInterval` handlers capturing stale state variables in their closure instead of using functional updates (`setCount(c => c + 1)`) or current refs.
  - Creating duplicate subscriptions on every component re-render due to missing dependency arrays.
- **Evidence:**
  - `useEffect(() => { eventBus.on('update', handleUpdate); }, []);` without `return () => eventBus.off('update', handleUpdate);`.
  - `setInterval(() => { setCount(count + 1); }, 1000);` where `count` is always captured as initial `0`.
- **Avoid:**
  - Flagging subscriptions with verified cleanup returns or standard framework auto-cleanup subscriptions (e.g. Angular `async` pipe, Svelte `$store`).
- **Remediation:**
  - Always return cleanup functions in lifecycle subscription hooks.
  - Use functional state updates (`setState(prev => ... )`) or `useRef` to access fresh state values inside asynchronous callbacks.
- **Severity:** High

---

## FSM09: State Mutation & Change Detection Safety

- **Purpose:** Prevent in-place object or array mutations that bypass framework change detection, break shallow equality checks, or corrupt history snapshots.
- **Detect:**
  - Direct mutation of state arrays or objects in React/Redux: `items.push(newItem); setItems(items);` or `user.name = 'New'; setUser(user);`.
  - Mutating objects that are shared across multiple components or stored in historical snapshot arrays (undo/redo stacks).
  - Passing mutable references into child components where children modify parent state properties directly.
- **Evidence:**
  - `const list = state.items; list.sort(); setState({ ...state, items: list });` (mutates original array in-place, preventing component re-render).
- **Avoid:**
  - Flagging mutation in frameworks designed for fine-grained reactive proxies (Vue 3 `reactive()`, MobX, Svelte 5 runes).
- **Remediation:**
  - Create immutable shallow or deep copies before modifying: `setItems([...items, newItem]);`.
  - Use immutable update utilities (e.g. Immer `produce()`) for complex nested object updates.
- **Severity:** High

---

## FSM10: Multi-Layer Data Flow & Boundary Contracts

- **Purpose:** Ensure state modifications flowing across disparate UI, business logic, and API adapter layers preserve domain invariants and validation rules.
- **Detect:**
  - Bypassing domain validation by mutating state through backdoor utility functions or uncontrolled global hooks.
  - State updates occurring in multiple disconnected layers where order of execution determines business outcome unpredictably.
  - Child components triggering side-effect mutations in grandparent state without explicit contract or events.
- **Evidence:**
  - Form component submits order directly while bypassing cart state validator, leaving order total inconsistent with line items.
  - Multiple services mutating a shared order state object concurrently with conflicting discount calculations.
- **Avoid:**
  - Flagging well-defined event emitter or state store dispatch patterns with centralized validation.
- **Remediation:**
  - Centralize domain validation within state stores or reducer action handlers before committing state changes.
  - Enforce explicit unidirectional event or command interfaces between UI layers and domain state.
- **Severity:** Medium

