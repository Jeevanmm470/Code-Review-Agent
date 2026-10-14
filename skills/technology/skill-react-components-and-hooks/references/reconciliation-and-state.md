# React Reconciliation, Keys & State Flow Reference

Provides rules for key selection, reconciliation stability, component identity, ref safety, and immutable state updates.

---

## Actionable Technology Rules

### REACT-RECON-001: Array Index Keys in Dynamic/Mutable Lists
- **Applies To**: Rendered lists via `.map()`, table rows, dynamic form fields, sortable items.
- **Behavior**: Using array index as `key` (`key={index}`) when items can be inserted, reordered, filtered, or deleted causes React to mismatch DOM state, leading to focus loss, corrupted input values, and incorrect animation transitions.
- **Inspect**: `.map((item, index) => <Component key={index} ... />)` on lists that support sorting, filtering, adding, or deleting items.
- **Violation**:
  ```tsx
  export function TodoList({ todos, onDelete }: { todos: Todo[]; onDelete: (id: string) => void }) {
    return (
      <ul>
        {todos.map((todo, index) => (
          <li key={index}> {/* Index key on mutable list */}
            <input defaultValue={todo.text} />
            <button onClick={() => onDelete(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    );
  }
  ```
- **Evidence**: Dynamic/interactive list using `index` as `key` where items can change order or length.
- **False Positives**: Completely static, immutable lists (e.g. fixed navigation links) that are never filtered, sorted, or mutated at runtime.
- **Remediation**: Use a stable, unique identifier from the item entity: `key={todo.id}`.
- **Engineering Skill Map**: `MAINT01`, `FCD03`

---

### REACT-RECON-002: In-Render Component Declarations Breaking Identity
- **Applies To**: Defining nested React components inside another component's render body.
- **Behavior**: Declaring a component function inside another component creates a new component type reference on every render, forcing React to unmount and remount the child tree completely, destroying all internal state and DOM focus.
- **Inspect**: `function ChildComponent(...)` or `const Child = (...) => ...` declared inside a parent component's body.
- **Violation**:
  ```tsx
  export function ParentForm() {
    const [name, setName] = useState('');
    // Violation: Child component re-declared on every parent render!
    const CustomInput = () => <input value={name} onChange={e => setName(e.target.value)} />;
    return <div><CustomInput /></div>;
  }
  ```
- **Evidence**: Component function declaration nested directly inside the render execution path of another component.
- **False Positives**: Helper rendering functions returning JSX expressions directly (e.g. `renderHeader()`), though extracting to a standalone component is generally preferred.
- **Remediation**: Move the nested component definition outside the parent component, passing needed state as props.
- **Engineering Skill Map**: `FCD01`, `skill-eng-modularity`

---

### REACT-RECON-003: Ref Mutations During Render Phase
- **Applies To**: `useRef`, mutable ref objects (`ref.current`).
- **Behavior**: Mutating `ref.current` during the render body (outside of `useEffect`, `useLayoutEffect`, or event handlers) violates React's pure rendering rules, causing non-deterministic behavior under Concurrent Mode.
- **Inspect**: `ref.current = newValue` placed directly in the component body during render execution.
- **Violation**:
  ```tsx
  export function RenderTracker({ count }: { count: number }) {
    const renderCount = useRef(0);
    renderCount.current += 1; // Violation: Ref mutation during render phase!
    return <div>Count: {count}, Renders: {renderCount.current}</div>;
  }
  ```
- **Evidence**: Direct mutation of `ref.current` outside of lifecycle effects or event callbacks.
- **False Positives**: Lazy initialization pattern (`if (ref.current === null) { ref.current = new HeavyObject(); }`).
- **Remediation**: Mutate refs inside `useEffect` or event handlers, or use state if the value influences visual output.
- **Engineering Skill Map**: `MAINT01`, `FSM01`

