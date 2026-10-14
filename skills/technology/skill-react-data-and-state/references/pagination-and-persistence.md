# React Pagination, Persistence & Hydration Reference

Provides rules for pagination state, infinite loading, client persistence, and hydration recovery in React.

---

## Actionable Technology Rules

### RDS-PAG-001: Desynchronized Pagination & Filter State
- **Applies To**: Data grids, paginated tables, search filter sidebars.
- **Behavior**: Updating search keywords, category filters, or sort criteria without resetting the active page index to `1` (or clearing cursor token) causes queries for non-existent high pages (e.g. Page 15 of a 1-page search result), returning empty screens or 404 errors.
- **Inspect**: Filter change handlers that update filter state without resetting `page` / `cursor`.
- **Violation**:
  ```tsx
  export function CatalogView() {
    const [page, setPage] = useState(1);
    const [category, setCategory] = useState('all');

    const handleCategoryChange = (cat: string) => {
      // Violation: Category changes but page remains at current page (e.g. page 10)!
      setCategory(cat);
    };

    return <div>...</div>;
  }
  ```
- **Evidence**: State setter for filter criteria that does not reset pagination page index to initial value.
- **False Positives**: Multi-criteria filters that submit atomically via a single form submit action that includes `page: 1`.
- **Remediation**: Reset page number whenever search criteria change:
  ```tsx
  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };
  ```
- **Engineering Skill Map**: `FSM01`, `skill-fe-state-management`

---

### RDS-PAG-002: Infinite Query Stale Page Accumulation
- **Applies To**: `useInfiniteQuery`, infinite scroll loaders.
- **Behavior**: Accumulating paginated responses into a continuous list without clearing previous items when the root search query changes results in mixed results from different queries displayed in the same view.
- **Inspect**: Custom infinite scroll reducers concatenating `newItems` without resetting the accumulator array on filter changes.
- **Evidence**: List accumulator appending new query results to old query results.
- **False Positives**: Standard `useInfiniteQuery` where query key changes automatically reset the pages array.
- **Remediation**: Ensure query key includes the filter parameter or reset the local accumulator on query change.
- **Engineering Skill Map**: `FSM03`, `skill-eng-loop-and-iteration-safety`

---

### RDS-PERSIST-001: Persisted State Leaks & Stale Schema Deserialization
- **Applies To**: `localStorage`, `sessionStorage`, `redux-persist`, Zustand `persist` middleware.
- **Behavior**: Persisting sensitive user session data or auth tokens across logouts, or deserializing outdated cached schemas without migration versioning, leads to security leaks and runtime crashes on schema updates.
- **Inspect**: Storage persistence configurations lacking schema versioning / migration handlers, or logout functions that fail to clear persisted local storage keys.
- **Evidence**: Logout action omitting `localStorage.clear()` / storage key removal, or `JSON.parse(localStorage.getItem(...))` without schema validation or version check.
- **False Positives**: Storing non-sensitive public UI preferences (e.g. theme preference `'light' | 'dark'`).
- **Remediation**: Clear user storage keys on logout and wrap persisted state deserialization in schema validation (e.g. Zod) or version migrations.
- **Engineering Skill Map**: `FSM07`, `skill-fe-frontend-security`

