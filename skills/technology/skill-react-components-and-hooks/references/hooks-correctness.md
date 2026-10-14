# React Hooks Correctness & State Reference

Provides React Hooks rules, stale closure detection, dependency array validation, and custom hook guidelines.

---

## Actionable Technology Rules

### REACT-HOOK-001: Rules of Hooks & Conditional Execution
- **Applies To**: Any React functional component or custom hook (`use*`).
- **Behavior**: Calling hooks conditionally, inside loops, or after early return statements breaks React's fiber hook linked list, leading to memory corruption or crashes.
- **Inspect**: `if`, `for`, `while`, or `switch` blocks enclosing `useState`, `useEffect`, `useMemo`, `useCallback`, or custom hooks; or hooks placed after conditional `return` statements.
- **Violation**:
  ```tsx
  export function UserProfile({ user }: { user?: User }) {
    if (!user) return <div>No user</div>; // Early return!
    const [theme, setTheme] = useState('dark'); // Violation: Hook called after early return
    useEffect(() => { /* ... */ }, []);
    return <div>{user.name}</div>;
  }
  ```
- **Evidence**: Hook call positioned below an early return or inside a conditional branch.
- **False Positives**: Calling regular non-hook utility functions inside conditions.
- **Remediation**: Hoist all hook invocations to the top level of the component before any conditional checks or early returns.
- **Engineering Skill Map**: `MAINT01`, `skill-eng-maintainability`

---

### REACT-HOOK-002: Stale Closures & Dependency Array Completeness
- **Applies To**: `useEffect`, `useCallback`, `useMemo`, `useImperativeHandle`.
- **Behavior**: Omitting reactive values (state, props, derived variables) from dependency arrays captures stale closure references, producing desynchronized state and ghost actions.
- **Inspect**: Callback or effect functions accessing component variables that are omitted from `[]` dependency array; use of `// eslint-disable-next-line react-hooks/exhaustive-deps`.
- **Violation**:
  ```tsx
  export function Counter({ step }: { step: number }) {
    const [count, setCount] = useState(0);
    const increment = useCallback(() => {
      setCount(count + step); // Stale: captures initial `count` and `step`
    }, []); // Violation: Missing count and step in dependency array
    return <button onClick={increment}>Add</button>;
  }
  ```
- **Evidence**: Function reading state/props while the dependency array is empty or missing those identifiers.
- **False Positives**: Stable setter functions (`setCount`), dispatch functions (`dispatch`), ref objects (`ref.current` is mutable but ref container is stable), or constants declared outside component scope.
- **Remediation**: Include all referenced reactive variables in the dependency array or use functional state updater `setCount(prev => prev + step)`.
- **Engineering Skill Map**: `MAINT01`, `skill-eng-maintainability`

---

### REACT-HOOK-003: Derived State & Redundant useEffect State Synchronization
- **Applies To**: `useState` + `useEffect` combinations recalculating state based on props or other state.
- **Behavior**: Using `useEffect` to synchronize or calculate state from other props/state introduces extra render cycles, layout flashes, and state desynchronization bugs.
- **Inspect**: `useEffect` containing `setState` that immediately computes a value derived from incoming props or existing state.
- **Violation**:
  ```tsx
  export function FullNameDisplay({ firstName, lastName }: { firstName: string; lastName: string }) {
    const [fullName, setFullName] = useState('');
    useEffect(() => {
      setFullName(`${firstName} ${lastName}`); // Redundant state + extra render!
    }, [firstName, lastName]);
    return <h1>{fullName}</h1>;
  }
  ```
- **Evidence**: `useEffect` whose only action is setting local state derived directly from other state or props.
- **False Positives**: Resetting form state when a key entity ID changes (though `key={entityId}` is often cleaner) or asynchronous data fetching triggered by prop changes.
- **Remediation**: Calculate derived state inline during render: `const fullName = `${firstName} ${lastName}`;`. Use `useMemo` only if calculation is computationally expensive.
- **Engineering Skill Map**: `MAINT03`, `skill-fe-state-management`

---

### REACT-HOOK-004: Custom Hook Design & Contracts
- **Applies To**: Custom hooks (`useSomething.ts`).
- **Behavior**: Custom hooks returning raw internal setters without encapsulation, returning non-tuple/non-object primitives, or performing side effects without exposing status flags.
- **Inspect**: Custom hooks that do not prefix with `use`, return >5 unstructured items in array tuples, or expose implementation details (e.g. raw Redux dispatch).
- **Evidence**: Un-prefixed hook or bloated return interface.
- **False Positives**: Utility functions that do not call any React hooks internally (should be regular helper functions, not `use*`).
- **Remediation**: Prefix with `use`, return structured object for >2 values, and expose clear semantic action handlers (e.g. `openModal`, `closeModal`) instead of raw state setters.
- **Engineering Skill Map**: `FCD04`, `skill-eng-modularity`

