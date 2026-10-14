# Render Behavior, Component Identity & Reconciliation Reference

## 1. Overview & Rendering Mechanics

React rendering executes the component function to produce a React element tree (JSX). React then reconciles this tree against the previous render to determine what DOM operations are needed.

Crucial distinctions for code review:
- **Render execution**: Calling component functions and hooks. Fast in isolation unless heavy synchronous work is performed.
- **Commit / DOM update**: Mutating actual browser DOM nodes. Expensive when large subtrees or remounts occur.
- **Remounting**: Unmounting an old DOM node/component state and mounting a new one from scratch. Destroys all child DOM nodes, resets internal state (`useState`, `useRef`), and re-executes all mount effects.

---

## 2. Detailed Review Rules

### RRP-ID-001: Component Definition Inside Render Function (`RRP02`)

- **Defect**: Defining a component function or component class inside the body of another component.
- **Consequence**: Every time the parent renders, a new component function reference is created. React sees a completely new component type, forcing unmounting of the entire subtree, complete loss of local state, and full DOM reconstruction.
- **Detection Pattern**:
  ```tsx
  // BAD: Component defined inside parent render body
  function Dashboard() {
    const [count, setCount] = useState(0);

    // Re-created on every render with a new identity!
    function ChildProfile() {
      const [localInput, setLocalInput] = useState('');
      return <input value={localInput} onChange={e => setLocalInput(e.target.value)} />;
    }

    return (
      <div>
        <button onClick={() => setCount(c => c + 1)}>Increment {count}</button>
        <ChildProfile /> {/* Destroys input and focus on every button click! */}
      </div>
    );
  }
  ```
- **Remediation**:
  ```tsx
  // GOOD: Declare component outside or extract to separate module
  function ChildProfile() {
    const [localInput, setLocalInput] = useState('');
    return <input value={localInput} onChange={e => setLocalInput(e.target.value)} />;
  }

  function Dashboard() {
    const [count, setCount] = useState(0);
    return (
      <div>
        <button onClick={() => setCount(c => c + 1)}>Increment {count}</button>
        <ChildProfile />
      </div>
    );
  }
  ```

---

### RRP-ID-002: Render Phase Purity & Side Effects (`RRP01`)

- **Defect**: Mutating external state, dispatching actions, or modifying DOM attributes directly during the render execution phase (outside event handlers or `useEffect`).
- **Consequence**: Produces unpredictable UI state, triggers infinite re-render loops (`Too many re-renders`), breaks React Concurrent Mode, and causes double-execution issues in Strict Mode.
- **Detection Pattern**:
  ```tsx
  // BAD: Mutating external store or calling setState during render phase
  function BadMetrics({ count }: { count: number }) {
    if (count > 10) {
      // Direct state setter call during render!
      analyticsStore.track('threshold_reached');
      setWarningState(true);
    }
    return <div>{count}</div>;
  }
  ```
- **Remediation**:
  ```tsx
  // GOOD: Perform side-effects inside useEffect or event handlers
  function GoodMetrics({ count }: { count: number }) {
    useEffect(() => {
      if (count > 10) {
        analyticsStore.track('threshold_reached');
        setWarningState(true);
      }
    }, [count]);

    return <div>{count}</div>;
  }
  ```

---

### RRP-ID-003: Key Stability in Dynamic Lists (`RRP03`)

- **Defect**: Using array indices, `Math.random()`, or unstable keys for dynamic lists where items can be reordered, inserted, or removed.
- **Consequence**: Causes DOM recycling bugs, inputs bound to sibling states, animation glitches, and defeats React reconciliation leading to full list re-rendering.
- **Detection Pattern**:
  ```tsx
  // BAD: Unstable random key generates remount on every render
  <ul>
    {items.map(item => (
      <ItemRow key={Math.random()} item={item} />
    ))}
  </ul>

  // BAD: Index key on reorderable/deletable collection
  <ul>
    {items.map((item, index) => (
      <ItemRow key={index} item={item} onDelete={() => removeItem(item.id)} />
    ))}
  </ul>
  ```
- **Remediation**:
  ```tsx
  // GOOD: Stable, unique entity identifier
  <ul>
    {items.map(item => (
      <ItemRow key={item.id} item={item} onDelete={() => removeItem(item.id)} />
    ))}
  </ul>
  ```

---

## 3. False-Positive Safeguards

1. **Static, Non-Reordering Arrays**: Using array index `key={index}` is acceptable when the array is strictly static (e.g. constant tab names, hardcoded navigation links) and never filtered, sorted, or mutated.
2. **Helper Render Functions**: A helper function returning JSX (e.g., `const renderHeader = () => <h1>{title}</h1>`) called as `{renderHeader()}` does NOT create a new component identity (though extracting to a top-level component is often cleaner).
3. **Intentional State Reset via Key**: Passing a key to a component to intentionally reset its state when an ID changes (e.g., `<UserProfile key={userId} />`) is an idiomatic React pattern and NOT a defect.

