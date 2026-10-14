# React Components and Hooks Review Checklist

Consolidated rule index `REACT01` through `REACT10` for React component architecture, Hooks correctness, effect lifecycles, and reconciliation.

---

## Rule Index

| ID | Rule Name | Severity | Primary Target |
|---|---|---|---|
| `REACT01` | Component Cohesion & Single Responsibility | HIGH | Component mixing heavy calculations, direct API fetch, and complex UI |
| `REACT02` | Explicit Prop Contracts & Controlled State | HIGH | Hybrid controlled/uncontrolled state or missing callback propagation |
| `REACT03` | Rules of Hooks & Call Placement | CRITICAL | Hooks called conditionally, inside loops, or after early returns |
| `REACT04` | Exhaustive Dependencies & Stale Closures | HIGH | Missing variables in effect/callback dependency arrays |
| `REACT05` | Derived State vs Redundant Effects | MEDIUM | Using `useEffect` + `setState` for values derivable during render |
| `REACT06` | Effect Lifecycle & Resource Cleanup | HIGH | Event listeners, timers, or observers missing cleanup teardown |
| `REACT07` | Custom Hook Boundaries & Contracts | MEDIUM | Un-prefixed hooks or un-encapsulated internal state exposure |
| `REACT08` | Stable Keys & Collection Identity | HIGH | Index keys on dynamic, mutable, or sortable lists |
| `REACT09` | Strict Mode & Idempotent Rendering | MEDIUM | Destructive non-idempotent side effects during render or mount |
| `REACT10` | Ref Semantics & Non-Reactive Escapes | MEDIUM | Direct mutation of `ref.current` during render phase |

---

## Detailed Rule Inspection Guide

### REACT01: Component Cohesion & Single Responsibility
- [ ] Component separates business calculation logic from UI presentation.
- [ ] Data fetching is extracted to custom hooks or container layers.
- ❌ **Anti-pattern:** Monolithic component managing raw math, API orchestration, and large JSX layouts in one function.
- ✅ **Remediation:** Extract calculations into pure helper modules and data orchestration into a custom hook.

### REACT02: Explicit Prop Contracts & Controlled State
- [ ] Component is clearly controlled (`value` + `onChange`) or uncontrolled (`defaultValue`).
- [ ] Internal state does not silently ignore updates to incoming control props.
- ❌ **Anti-pattern:** `const [val, setVal] = useState(props.value)` ignoring subsequent changes to `props.value`.
- ✅ **Remediation:** Use `props.value` directly if controlled; use `defaultValue` if uncontrolled.

### REACT03: Rules of Hooks & Call Placement
- [ ] All hooks (`useState`, `useEffect`, `useMemo`, custom hooks) are called at the top level of the component.
- [ ] No hooks exist inside `if` statements, loops, nested helper functions, or below early returns.
- ❌ **Anti-pattern:** `if (!data) return null; const [count, setCount] = useState(0);`
- ✅ **Remediation:** Hoist all hook invocations to the top of the component function before any return statements.

### REACT04: Exhaustive Dependencies & Stale Closures
- [ ] `useEffect`, `useCallback`, and `useMemo` dependency arrays contain all referenced reactive variables.
- [ ] Functional state updaters (`setState(prev => ...)`) are used when new state depends on previous state.
- ❌ **Anti-pattern:** `useCallback(() => setCount(count + 1), [])` causing stale count capture.
- ✅ **Remediation:** Add `count` to dependencies or use `setCount(prev => prev + 1)`.

### REACT05: Derived State vs Redundant Effects
- [ ] Values computable from existing props and state are calculated inline during render.
- [ ] `useEffect` is not used solely to sync state when props change.
- ❌ **Anti-pattern:** `useEffect(() => { setFiltered(items.filter(...)) }, [items])`.
- ✅ **Remediation:** `const filtered = useMemo(() => items.filter(...), [items]);` or inline computation.

### REACT06: Effect Lifecycle & Resource Cleanup
- [ ] All `addEventListener`, `setInterval`, `setTimeout`, and subscriptions in `useEffect` return a cleanup function.
- [ ] Asynchronous fetches in `useEffect` implement `AbortController` cancellation to prevent race conditions.
- ❌ **Anti-pattern:** `useEffect(() => { window.addEventListener('scroll', handler); }, [])` with no removeEventListener.
- ✅ **Remediation:** `return () => window.removeEventListener('scroll', handler);`.

### REACT07: Custom Hook Boundaries & Contracts
- [ ] Custom hooks start with `use` prefix.
- [ ] Custom hooks return structured, clear contracts (tuples for 1-2 values, objects for multiple values).
- ❌ **Anti-pattern:** Hook exposing internal Redux dispatch or returning unstructured arrays of 6 items.
- ✅ **Remediation:** Encapsulate operations into named actions (`toggle`, `reset`) and return structured objects.

### REACT08: Stable Keys & Collection Identity
- [ ] Collection items mapped in JSX use persistent, unique IDs as keys.
- [ ] Array indexes are not used as keys for lists that can be filtered, sorted, added, or deleted.
- ❌ **Anti-pattern:** `items.map((item, index) => <ListItem key={index} item={item} />)` on mutable list.
- ✅ **Remediation:** Use `key={item.id}`.

### REACT09: Strict Mode & Idempotent Rendering
- [ ] Component render functions are pure (no side effects during render).
- [ ] Effect setup and teardown are symmetrical and resilient to double invocation.
- ❌ **Anti-pattern:** Incrementing global counter or sending non-idempotent tracking events in render body.
- ✅ **Remediation:** Move side effects into `useEffect` or event handlers.

### REACT10: Ref Semantics & Non-Reactive Escapes
- [ ] `ref.current` is not written to or read from during the render phase.
- [ ] DOM refs are accessed strictly inside lifecycle effects or event callbacks.
- ❌ **Anti-pattern:** `myRef.current = calculateSomething()` in the component render body.
- ✅ **Remediation:** Use `useState` if the value determines render output, or mutate ref in `useEffect`.

