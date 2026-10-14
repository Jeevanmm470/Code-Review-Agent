# Transitions, Scheduling & Hydration Reference

## 1. Overview & Mechanics

React 18 introduced Concurrent features that allow state updates to be prioritized:
1. **Urgent updates**: Direct user interactions (typing, clicking, hovering) that must update the screen immediately.
2. **Transition updates**: Non-urgent UI transitions (filtering a large table, switching tabs, rendering complex charts) that can be interrupted by urgent updates.
3. **Suspense & Hydration**: Coordinated rendering across asynchronous boundaries and server-rendered HTML markup.

---

## 2. Detailed Review Rules

### RRP-SCHED-001: Blocking Urgent Inputs with Heavy State Transitions (`RRP08`)

- **Defect**: Synchronously updating heavy non-urgent UI state on the same render cycle as a high-frequency input event (e.g. typing in a search bar triggering both text update and heavy tree re-render).
- **Consequence**: Input stutter, dropped keystrokes, and sluggish responsiveness because the main thread is blocked rendering the heavy subtree.
- **Detection Pattern**:
  ```tsx
  // BAD: Both input text and heavy view update in a single urgent render
  function SearchInterface({ allRecords }: { allRecords: Record[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState(allRecords);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearchTerm(term); // Urgent
      setFilteredData(performHeavySearch(allRecords, term)); // Heavy & non-urgent!
    };

    return (
      <div>
        <input value={searchTerm} onChange={handleChange} />
        <HeavyDataGrid data={filteredData} />
      </div>
    );
  }
  ```
- **Remediation**:
  ```tsx
  // GOOD: Mark heavy data filtering as a non-urgent transition
  import { useTransition } from 'react';

  function SearchInterface({ allRecords }: { allRecords: Record[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState(allRecords);
    const [isPending, startTransition] = useTransition();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearchTerm(term); // Immediate input responsiveness

      startTransition(() => {
        setFilteredData(performHeavySearch(allRecords, term)); // Concurrent interruptible transition
      });
    };

    return (
      <div>
        <input value={searchTerm} onChange={handleChange} />
        {isPending && <Spinner />}
        <HeavyDataGrid data={filteredData} />
      </div>
    );
  }
  ```

---

### RRP-SCHED-002: Coarse Suspense Boundaries & Cascading Layout Shifts (`RRP08`)

- **Defect**: Wrapping an entire page or large layout in a single high-level `<Suspense>` boundary when localized parts of the UI load asynchronously.
- **Consequence**: The entire screen is replaced with a blank spinner during minor background updates, destroying user context and causing layout instability.
- **Remediation**: Place `<Suspense>` boundaries granularly around individual async widgets or components.

---

### RRP-SCHED-003: SSR Hydration Mismatches & Double Rendering (`RRP10`)

- **Defect**: Rendering browser-only values (e.g., `window.innerWidth`, `localStorage`, `new Date().toLocaleTimeString()`) directly in JSX during initial render on SSR/SSG.
- **Consequence**: React encounters a DOM mismatch during hydration, throws warnings, and discards the server-rendered DOM to perform an expensive client-side re-render of the entire subtree.
- **Detection Pattern**:
  ```tsx
  // BAD: Direct window access during SSR render
  function ClientHeader() {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return <header className={isMobile ? 'mobile' : 'desktop'}>...</header>;
  }
  ```
- **Remediation**:
  ```tsx
  // GOOD: Initialize after mount or use useSyncExternalStore with server snapshot
  function ClientHeader() {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
      setIsClient(true);
    }, []);

    const isMobile = isClient && window.innerWidth < 768;
    return <header className={isMobile ? 'mobile' : 'desktop'}>...</header>;
  }
  ```

---

## 3. False-Positive Safeguards

1. **`useTransition` in React < 18**: Do not recommend `useTransition` or `useDeferredValue` if the project uses React 17 or older.
2. **Simple Controlled Inputs**: Basic text inputs that only update a string state and do not render expensive subtrees do NOT need `useTransition`.
3. **Controlled Fallbacks**: Intentional full-page loading indicators for initial route authentication checks are valid and should not be flagged as coarse Suspense boundaries.

