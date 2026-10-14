# React Data and State Review Checklist

Consolidated rule index `RDS01` through `RDS10` for React data fetching, state management, caching, mutations, and persistence.

---

## Rule Index

| ID | Rule Name | Severity | Primary Target |
|---|---|---|---|
| `RDS01` | State Ownership & Single Source of Truth | HIGH | Duplicate state copies of server/prop data causing desynchronization |
| `RDS02` | Immutable State Updates & Invariant Safety | HIGH | In-place array/object mutations breaking React change detection |
| `RDS03` | Async Sequence Safety & Request Cancellation | HIGH | Out-of-order async responses overwriting newer search/filter state |
| `RDS04` | Request Status & Tri-State UI Transitions | MEDIUM | Conflating empty state with loading or error states |
| `RDS05` | Complete Query Keys & Cache Scope | HIGH | Query keys omitting filter, pagination, or tenant parameters |
| `RDS06` | Post-Mutation Cache Invalidation & Freshness | HIGH | Mutations failing to invalidate or update related cached queries |
| `RDS07` | Optimistic Updates & Safe Rollback | HIGH | Optimistic cache writes lacking previous snapshot capture and error rollback |
| `RDS08` | Duplicate Submission & Mutation Locks | MEDIUM | Non-idempotent form submit buttons enabled during pending mutation |
| `RDS09` | Pagination State & Filter Synchronization | MEDIUM | Changing search filters without resetting active page index |
| `RDS10` | Persisted State Sanitization & Schema Migration | HIGH | Un-cleared user/auth storage on logout or unvalidated deserialization |

---

## Detailed Rule Inspection Guide

### RDS01: State Ownership & Single Source of Truth
- [ ] Server data is read from authoritative cache/props rather than duplicated in local state.
- [ ] Form editing drafts have explicit isolation boundaries and reset mechanisms on ID change.
- ❌ **Anti-pattern:** Mirroring incoming `user` prop into multiple local states without observing changes.
- ✅ **Remediation:** Read directly from props/cache, or key component by entity ID (`key={user.id}`).

### RDS02: Immutable State Updates & Invariant Safety
- [ ] State updates use pure immutable copies (`[...items, newItem]`, `{ ...user, name }`).
- [ ] Direct array mutations (`.push()`, `.splice()`, `.sort()`) on state variables are forbidden outside Immer.
- ❌ **Anti-pattern:** `items.push(newItem); setItems(items);`
- ✅ **Remediation:** `setItems(prev => [...prev, newItem]);`.

### RDS03: Async Sequence Safety & Request Cancellation
- [ ] Asynchronous fetches in `useEffect` implement `AbortController` cancellation or sequence IDs.
- [ ] Outdated promise resolutions cannot overwrite newer query state.
- ❌ **Anti-pattern:** Search input triggering uncancelled async fetch on every keystroke.
- ✅ **Remediation:** Use `AbortController` and pass `signal` to `fetch`, aborting in cleanup.

### RDS04: Request Status & Tri-State UI Transitions
- [ ] Loading spinners render while request is active before evaluating empty state.
- [ ] Empty result placeholders are distinct from error messages.
- ❌ **Anti-pattern:** `if (!data.length) return <Empty />` displayed while `isLoading === true`.
- ✅ **Remediation:** Evaluate `isLoading`, then `error`, then `data.length === 0`.

### RDS05: Complete Query Keys & Cache Scope
- [ ] TanStack Query `queryKey` includes all variables consumed by `queryFn` (filters, page, sort).
- [ ] Cache entries do not leak across different users or tenants.
- ❌ **Anti-pattern:** `useQuery({ queryKey: ['orders'], queryFn: () => fetchOrders(filter, page) })`.
- ✅ **Remediation:** `queryKey: ['orders', { filter, page }]`.

### RDS06: Post-Mutation Cache Invalidation & Freshness
- [ ] Successful mutations call `queryClient.invalidateQueries()` or `setQueryData()` for affected resources.
- ❌ **Anti-pattern:** `useMutation(createItem)` with empty `onSuccess` leaving list query stale.
- ✅ **Remediation:** Invalidate relevant query keys in `onSuccess` or `onSettled`.

### RDS07: Optimistic Updates & Safe Rollback
- [ ] Optimistic mutations return previous state snapshot context in `onMutate`.
- [ ] `onError` handler restores previous snapshot if mutation fails.
- ❌ **Anti-pattern:** Overwriting cache in `onMutate` without saving previous data for rollback.
- ✅ **Remediation:** Snapshot cache in `onMutate` and restore via `setQueryData` in `onError`.

### RDS08: Duplicate Submission & Mutation Locks
- [ ] Non-idempotent action triggers disable the submit button while mutation is pending (`isPending`).
- ❌ **Anti-pattern:** Submit payment button clickable repeatedly during active network request.
- ✅ **Remediation:** `<button disabled={mutation.isPending}>Submit</button>`.

### RDS09: Pagination State & Filter Synchronization
- [ ] Changing filter or search query resets active pagination page to `1`.
- ❌ **Anti-pattern:** Setting search query while page remains at `10`, producing 0 results.
- ✅ **Remediation:** Reset `page` state to `1` in filter change event handlers.

### RDS10: Persisted State Sanitization & Schema Migration
- [ ] User logout purges user-specific tokens and state from `localStorage` / `sessionStorage`.
- [ ] Persisted state deserialization handles schema version upgrades safely.
- ❌ **Anti-pattern:** User logs out but previous user's cached tenant data remains in localStorage.
- ✅ **Remediation:** Clear sensitive storage keys on logout and validate persisted schemas.

