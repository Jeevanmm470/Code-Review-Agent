# Collections, Lists & Virtualization Reference

## 1. Overview & Scale Constraints

Rendering collections of items is a primary source of DOM bloat and scroll performance bottlenecks in frontend applications.

Key considerations:
1. **DOM Node Count**: Rendering 1,000+ complex DOM nodes simultaneously consumes significant browser memory and triggers expensive style calculation and layout passes.
2. **Item Component Complexity**: When each list item mounts multiple hooks, event listeners, or sub-components, rendering thousands of items creates measurable main-thread jank.
3. **Windowing / Virtualization**: Only rendering the visible subset of items in the viewport (plus an overscan buffer) using libraries like TanStack Virtual (`@tanstack/react-virtual`), `react-window`, or `react-virtualized`.

---

## 2. Detailed Review Rules

### RRP-LIST-001: Unbounded Large Collection Rendering (`RRP07`)

- **Defect**: Rendering hundreds or thousands of complex items in a single non-virtualized scroll container where evidence indicates unbounded growth (e.g. audit logs, transaction histories, live event feeds).
- **Consequence**: Severe scroll latency, high memory consumption, mobile browser crashes, and delayed input response during scrolling.
- **Detection Pattern**:
  ```tsx
  // BAD: Rendering 5,000 complex transaction rows directly into the DOM
  function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
    return (
      <div className="scroll-container">
        {transactions.map(item => (
          <ComplexTransactionRow key={item.id} item={item} />
        ))}
      </div>
    );
  }
  ```
- **Remediation**:
  ```tsx
  // GOOD: Virtualize list when item volume is large/unbounded
  import { useVirtualizer } from '@tanstack/react-virtual';

  function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
      count: transactions.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 60,
      overscan: 5,
    });

    return (
      <div ref={parentRef} className="scroll-container" style={{ height: '600px', overflow: 'auto' }}>
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const item = transactions[virtualRow.index];
            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <ComplexTransactionRow item={item} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  ```

---

### RRP-LIST-002: Per-Item Allocations in High-Volume Lists (`RRP04` / `RRP07`)

- **Defect**: Allocating new inline functions or closures for every item inside `.map()` when passing props to memoized item components in large lists.
- **Consequence**: Defeats `React.memo` on item rows, causing all list items to re-render when a single item or parent state changes.
- **Remediation**: Pass a stable handler that takes an ID, or use memoized callback factories / currying.
  ```tsx
  // Pass item id directly to memoized child or use stable handler
  const ListItem = React.memo(function ListItem({
    item,
    onSelect
  }: {
    item: Item;
    onSelect: (id: string) => void;
  }) {
    return <div onClick={() => onSelect(item.id)}>{item.name}</div>;
  });
  ```

---

## 3. False-Positive Safeguards

1. **Small Fixed Collections**: Do NOT recommend virtualization for pagination-controlled views (e.g. 10–25 items per page) or static dropdowns. Virtualization introduces complexity and accessibility challenges (e.g. keyboard navigation, screen reader flow) that are unjustified for small lists.
2. **Simple Lightweight Nodes**: A list of 50 simple text pills (`<span>{tag}</span>`) does not warrant virtualization.

