# Memoization & Referential Stability Reference

## 1. Overview & Mechanics

React re-renders children when parent components render, unless the child is wrapped in `React.memo` (or memoized by the React Compiler) and its props are shallowly equal (`Object.is`).

Common pitfalls:
1. **Memoization Defeat**: Wrapping a child in `React.memo`, but the parent passes freshly allocated objects, arrays, or inline functions on every render.
2. **Missing In-Render Memoization**: Performing heavy non-trivial synchronous calculations (sorting 1,000 items, complex graph traversals) on every render without `useMemo`.
3. **Pointless / Over-Memoization**: Wrapping trivial arithmetic, primitive values, or light computations in `useMemo`/`useCallback` when there are no memoized consumers downstream.

---

## 2. Detailed Review Rules

### RRP-MEMO-001: Defeated `React.memo` via Unstable Prop References (`RRP04`)

- **Defect**: A child component is explicitly optimized with `React.memo`, but the parent passes newly created object literals, array literals, or unmemoized arrow functions.
- **Consequence**: `React.memo` performs a prop comparison on every render, evaluates props as unequal due to fresh object references, and executes the full render anyway—wasting comparison CPU cycles.
- **Detection Pattern**:
  ```tsx
  // Child is memoized
  const ExpensiveChart = React.memo(function ExpensiveChart({ config, onSelect }: Props) {
    // Heavy rendering logic...
    return <div>...</div>;
  });

  // BAD: Parent passes new object and new arrow function on every render
  function AnalyticsView({ data }: { data: DataPoint[] }) {
    const [filter, setFilter] = useState('');

    return (
      <ExpensiveChart
        config={{ theme: 'dark', showLegend: true }} // New reference every render!
        onSelect={(id) => handleSelect(id)} // New callback reference every render!
      />
    );
  }
  ```
- **Remediation**:
  ```tsx
  const STATIC_CONFIG = { theme: 'dark', showLegend: true };

  function AnalyticsView({ data }: { data: DataPoint[] }) {
    const [filter, setFilter] = useState('');

    const handleSelect = useCallback((id: string) => {
      // selection logic
    }, []);

    return (
      <ExpensiveChart
        config={STATIC_CONFIG}
        onSelect={handleSelect}
      />
    );
  }
  ```

---

### RRP-MEMO-002: Heavy In-Render Computations Without `useMemo` (`RRP06`)

- **Defect**: Executing computationally expensive transformations, sorting, filtering, or JSON parsing directly in the component body on every render without `useMemo`.
- **Consequence**: Main thread blockage, dropped frames during user interactions, laggy keystroke inputs when unrelated state triggers re-renders.
- **Detection Pattern**:
  ```tsx
  // BAD: Synchronous heavy filtering & sorting over large collection on every render
  function OrderList({ orders, activeTab }: { orders: Order[]; activeTab: string }) {
    const [filterQuery, setFilterQuery] = useState('');

    // Re-computed on every unrelated state update (e.g., typing in search box)
    const processedOrders = orders
      .filter(o => o.status === activeTab)
      .filter(o => heavyFuzzySearch(o.description, filterQuery))
      .sort((a, b) => complexRankScore(b) - complexRankScore(a));

    return <div>...</div>;
  }
  ```
- **Remediation**:
  ```tsx
  function OrderList({ orders, activeTab }: { orders: Order[]; activeTab: string }) {
    const [filterQuery, setFilterQuery] = useState('');

    const processedOrders = useMemo(() => {
      return orders
        .filter(o => o.status === activeTab)
        .filter(o => heavyFuzzySearch(o.description, filterQuery))
        .sort((a, b) => complexRankScore(b) - complexRankScore(a));
    }, [orders, activeTab, filterQuery]);

    return <div>...</div>;
  }
  ```

---

### RRP-MEMO-003: Over-Memoization & Counterproductive Overhead (`RRP04`)

- **Defect**: Wrapping cheap primitive operations, simple string concatenations, or single property lookups in `useMemo` where the hook overhead and dependency checking exceed the calculation cost.
- **Consequence**: Cluttered codebase, increased memory allocations for dependency arrays, higher GC pressure with zero rendering benefit.
- **Detection Pattern**:
  ```tsx
  // BAD: Pointless memoization of trivial operations
  const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);
  const isEnabled = useMemo(() => count > 0, [count]);
  ```
- **Remediation**:
  ```tsx
  // GOOD: Calculate directly inline
  const fullName = `${firstName} ${lastName}`;
  const isEnabled = count > 0;
  ```

---

## 3. False-Positive Safeguards

1. **Unmemoized Callbacks on Native HTML Elements**: Passing `<button onClick={() => doSomething()}>` without `useCallback` is NOT a defect. Native DOM elements do not use `React.memo` and benefit nothing from callback reference stability.
2. **React Compiler Enabled**: When the repository enables React Compiler (`babel-plugin-react-compiler` or Next.js experimental compiler), manual `useMemo` and `useCallback` are automatically injected at build time. Do not flag missing manual memoization in compiled repositories.
3. **Small Collections**: Filtering or mapping arrays of 10–20 items inline is negligible in CPU time and does not require `useMemo` unless profiling demonstrates a hotspot.

