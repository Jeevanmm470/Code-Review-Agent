# React Effects & Resource Lifecycle Reference

Provides guidelines on React effect execution, setup/cleanup, timer/subscription lifecycles, and React Strict Mode behavior.

---

## Actionable Technology Rules

### REACT-LIFE-001: Missing Effect Cleanup on External Resources
- **Applies To**: `useEffect`, `useLayoutEffect`, DOM event listeners, `setInterval`, `setTimeout`, WebSockets, `ResizeObserver`, `IntersectionObserver`.
- **Behavior**: Establishing external subscriptions or timers without returning a cleanup function leaks memory, retains unmounted component references, and triggers state updates on unmounted components.
- **Inspect**: `useEffect` adding `addEventListener`, `setInterval`, or opening socket connections without returning a teardown function.
- **Violation**:
  ```tsx
  export function WindowResizeWatcher() {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      // Violation: Missing return () => window.removeEventListener('resize', handleResize);
    }, []);
    return <div>Width: {width}</div>;
  }
  ```
- **Evidence**: `addEventListener`, `setInterval`, or observer creation without a matching remove/clear in the effect's return callback.
- **False Positives**: Self-cleaning fire-and-forget single actions (e.g. logging an analytics page view).
- **Remediation**: Always return a cleanup function that disposes of the resource: `return () => window.removeEventListener('resize', handleResize);`.
- **Engineering Skill Map**: `RL01`, `RL02`, `skill-eng-resource-lifecycle`

---

### REACT-LIFE-002: Async Race Conditions & Unhandled Abort in Effects
- **Applies To**: `useEffect` executing asynchronous data fetches or network requests.
- **Behavior**: Fast sequential parameter changes (e.g. switching between user profile tabs) cause asynchronous responses to arrive out of order, overwriting newer state with stale data.
- **Inspect**: `useEffect` calling `fetch` or async API methods without an `AbortController` or boolean `isCancelled` flag.
- **Violation**:
  ```tsx
  export function UserCard({ userId }: { userId: string }) {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
      fetch(`/api/users/${userId}`)
        .then(res => res.json())
        .then(data => setUser(data)); // Out-of-order race condition!
    }, [userId]);
    return <div>{user?.name}</div>;
  }
  ```
- **Evidence**: Async promise chaining or `await` inside effect updating component state without cancellation token or active flag.
- **False Positives**: Data fetching using dedicated query libraries (TanStack Query, RTK Query, SWR) that natively manage cancellation and request deduplication.
- **Remediation**: Use `AbortController` and pass `signal` to `fetch`, aborting in cleanup:
  ```tsx
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => { if (err.name !== 'AbortError') console.error(err); });
    return () => controller.abort();
  }, [userId]);
  ```
- **Engineering Skill Map**: `RL04`, `FSM03`, `skill-fe-state-management`

---

### REACT-LIFE-003: Strict Mode Resiliency & Double Effect Invocation
- **Applies To**: React 18+ applications running in development Strict Mode.
- **Behavior**: React Strict Mode intentionally unmounts and remounts components (setup -> cleanup -> setup) to expose side-effects that break under re-execution.
- **Inspect**: Effects performing destructive non-idempotent one-way actions (e.g. mutating external global variables, creating non-resilient singleton connections) that fail on second invocation.
- **Evidence**: Component breaking or throwing errors when effect cleanup and re-run occurs.
- **False Positives**: Expected development-only console logs or double-render checks.
- **Remediation**: Ensure effect setup and cleanup are fully symmetrical and idempotent.
- **Engineering Skill Map**: `RL02`, `MAINT01`

