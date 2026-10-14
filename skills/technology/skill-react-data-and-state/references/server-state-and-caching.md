# React Server State & Caching Reference

Provides rules for server-state caching libraries (TanStack Query, SWR, RTK Query), query keys, invalidation, and freshness.

---

## Actionable Technology Rules

### RDS-CACHE-001: Incomplete Query Keys in Server Cache Libraries
- **Applies To**: `useQuery` (TanStack Query), `useSWR`, `useRTKQuery`.
- **Behavior**: Omitting query parameters (filters, pagination, sort, tenant/user ID) from the cache key causes different queries to share the same cache entry, displaying incorrect data across filter switches or user accounts.
- **Inspect**: `useQuery({ queryKey: ['todos'], queryFn: () => fetchTodos(status, page) })` where `status` and `page` are omitted from `queryKey`.
- **Violation**:
  ```tsx
  export function TodoList({ filter, page }: { filter: string; page: number }) {
    // Violation: queryKey does not include filter or page!
    const { data } = useQuery({
      queryKey: ['todos'],
      queryFn: () => api.getTodos({ filter, page })
    });
    return <ul>...</ul>;
  }
  ```
- **Evidence**: `queryFn` referencing variables that do not appear in `queryKey`.
- **False Positives**: Static queries that do not accept any dynamic arguments or global user contexts bound at client instance level.
- **Remediation**: Include all query parameters in the key array: `queryKey: ['todos', { filter, page }]`.
- **Engineering Skill Map**: `FSM06`, `skill-fe-state-management`

---

### RDS-CACHE-002: Missing Post-Mutation Query Invalidation
- **Applies To**: `useMutation`, `useSWRMutation`, custom mutation hooks.
- **Behavior**: Creating, updating, or deleting an entity without invalidating or updating the corresponding query cache leaves the UI displaying stale data until a full manual page refresh.
- **Inspect**: `useMutation` definitions lacking `onSuccess` handlers with `queryClient.invalidateQueries(...)` or direct cache update `setQueryData`.
- **Violation**:
  ```tsx
  export function useCreateTodo() {
    return useMutation({
      mutationFn: (newTodo: TodoInput) => api.createTodo(newTodo),
      // Violation: Missing onSuccess invalidation of ['todos'] query!
    });
  }
  ```
- **Evidence**: Mutation function resolving without invalidating queries or updating cache data.
- **False Positives**: Mutations where the response is not represented in any cached query (e.g. fire-and-forget email dispatch).
- **Remediation**: Invalidate the relevant query key in `onSuccess`:
  ```tsx
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  }
  ```
- **Engineering Skill Map**: `FSM06`, `skill-fe-state-management`

---

### RDS-CACHE-003: Overly Broad Cache Invalidation
- **Applies To**: `queryClient.invalidateQueries()`, SWR `mutate()`.
- **Behavior**: Calling parameterless `invalidateQueries()` or invalidating root keys (`['']`) after a minor item update triggers massive network request storms refetching every query in the application.
- **Inspect**: `invalidateQueries()` calls with generic root keys or empty arrays in localized mutation handlers.
- **Evidence**: Unscoped cache invalidation across the entire cache store.
- **False Positives**: Global user logout / tenant switch requiring a complete cache purge (`queryClient.clear()`).
- **Remediation**: Target specific entity query keys: `queryClient.invalidateQueries({ queryKey: ['todos', todoId] })`.
- **Engineering Skill Map**: `FSM06`, `skill-eng-performance`

