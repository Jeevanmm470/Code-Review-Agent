# React Data Fetching, Race Conditions & Cancellation Reference

Provides rules for data-fetching lifecycles, race conditions, request cancellation, and status transitions in React.

---

## Actionable Technology Rules

### RDS-FETCH-001: Asynchronous Race Conditions in Search & Filter Effects
- **Applies To**: `useEffect`, custom data hooks, search/filter inputs, pagination.
- **Behavior**: Triggering asynchronous fetches when query parameters change without response ordering checks causes slower earlier requests to resolve after faster later requests, overwriting newer state with stale results.
- **Inspect**: `useEffect` listening to `query`, `filter`, or `page` and setting state on promise resolution without `AbortController` or active sequence token.
- **Violation**:
  ```tsx
  export function SearchUsers({ query }: { query: string }) {
    const [results, setResults] = useState<User[]>([]);
    useEffect(() => {
      // Fast typing "a" then "ab" -> request("a") returns after request("ab"), displaying "a" results!
      fetch(`/api/users?search=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => setResults(data));
    }, [query]);
    return <UserList users={results} />;
  }
  ```
- **Evidence**: Asynchronous state update inside reactive effect without cancellation or stale response guard.
- **False Positives**: Using caching libraries (TanStack Query, SWR) that natively serialize requests by query key.
- **Remediation**: Use `AbortController` and pass `signal` to `fetch`, aborting previous requests in effect cleanup.
- **Engineering Skill Map**: `FSM03`, `skill-fe-state-management`

---

### RDS-FETCH-002: Mishandling Aborted Request Errors as Fatal Failures
- **Applies To**: `try-catch` blocks and `.catch()` handlers wrapping cancellable requests.
- **Behavior**: Catching `AbortError` or cancelled requests and setting generic error state (`setError("Failed to fetch")`) causes the UI to flash error alerts during normal typing or rapid navigation.
- **Inspect**: Catch blocks in `useEffect` or data hooks setting error state unconditionally without checking `err.name === 'AbortError'` or `axios.isCancel(err)`.
- **Violation**:
  ```tsx
  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => {
        // Violation: AbortError treated as server failure!
        setError(err.message);
      });
    return () => controller.abort();
  }, [url]);
  ```
- **Evidence**: Error state updated on aborted fetch requests.
- **False Positives**: Logging cancellations for non-visual diagnostic telemetry.
- **Remediation**: Guard error setter: `if (err.name !== 'AbortError') setError(err.message);`.
- **Engineering Skill Map**: `skill-eng-error-handling`, `FSM04`

---

### RDS-FETCH-003: Tri-State UI & Empty vs Error vs Loading Confusion
- **Applies To**: Data rendering views, tables, lists, detail cards.
- **Behavior**: Conflating empty data (`items.length === 0`) with loading or error states causes false "No items found" banners during initial network loads, or blank screens on network errors.
- **Inspect**: Render conditions where `!data || data.length === 0` renders empty state without checking `isLoading` or `error`.
- **Violation**:
  ```tsx
  export function ProjectList({ projects, isLoading, error }: Props) {
    if (error) return <ErrorMessage error={error} />;
    // Violation: During initial load before projects arrive, displays "No projects found" instead of spinner!
    if (!projects || projects.length === 0) return <div>No projects found</div>;
    if (isLoading) return <Spinner />;
    return <ul>...</ul>;
  }
  ```
- **Evidence**: Empty state condition evaluated before or without checking active `isLoading` flag.
- **False Positives**: Optimistic empty state placeholders in offline-first designs.
- **Remediation**: Check loading and error states before rendering empty state: `if (isLoading) return <Spinner />; if (error) return <Error />; if (projects.length === 0) return <Empty />;`.
- **Engineering Skill Map**: `FCD02`, `skill-fe-state-management`

