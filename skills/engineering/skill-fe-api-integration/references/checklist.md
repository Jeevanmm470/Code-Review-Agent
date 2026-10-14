# Frontend API Integration Inspection Checklist

This checklist defines review criteria, detection heuristics, evidence patterns, anti-patterns, remediation strategies, and default severities for rules `FAI01` through `FAI10`.

---

## FAI01: Request Construction & HTTP Semantics

- **Purpose:** Prevent malformed endpoint URLs, incorrect HTTP methods, unencoded query parameters, and invalid headers or body encodings.
- **Detect:**
  - String concatenation in query strings without `encodeURIComponent` or URLSearchParams (e.g. `/api/search?q=${userInput}` breaking on `&`, `?`, `#`, or whitespace).
  - Using `GET` requests with a payload body or `POST` requests where standard resource retrieval semantics without side effects are expected.
  - Sending JSON objects with `Content-Type: application/x-www-form-urlencoded` or multipart forms missing proper boundary headers.
  - Hardcoded base URLs (e.g. `http://localhost:3000` or production hostnames) bypassing environment configuration.
- **Evidence:**
  - `fetch(`/users?filter=${query}`)` failing when `query` contains special characters (`C&A` parsed as separate params).
  - Direct string substitution of path parameters lacking URI encoding.
- **Avoid:**
  - Flagging custom REST-like or RPC endpoint conventions (e.g. `/api/rpc/getUser`) that are valid within the application's backend architecture.
- **Remediation:**
  - Use `URLSearchParams` or HTTP client parameter serializers (`params: { q: query }`) for query encoding.
  - Use environment variables (`process.env.VITE_API_URL`, `import.meta.env`) for base URLs.
- **Severity:** High

---

## FAI02: Contract Compatibility & Type Mapping

- **Purpose:** Eliminate mismatches between frontend models and backend API contracts, preventing unvalidated response parsing, missing required fields, and silent data loss.
- **Detect:**
  - Frontend sending payloads that omit non-nullable backend schema fields or use mismatched types (e.g. sending string `"123"` when API requires numeric `123`).
  - Unsafe type assertions (`response.data as UserProfile`) without runtime parsing or fallback checks when accessing deeply nested properties.
  - Incorrect enum serialization (e.g. sending lowercase `"active"` when backend expects uppercase enum `"ACTIVE"`).
  - Unhandled date/time format conversions leading to `Invalid Date` or timezone shifts.
- **Evidence:**
  - Code accessing `res.data.user.profile.avatarUrl` directly without optional chaining or schema validation, throwing `TypeError: Cannot read properties of undefined`.
  - Mismatched DTO types where frontend interfaces diverge from OpenAPI/backend schema.
- **Avoid:**
  - Flagging flexible contract designs where optional fields or partial objects are explicitly supported by the backend schema.
- **Remediation:**
  - Use schema validation libraries (e.g. Zod, Yup, Valibot) or strict TypeScript generated types from OpenAPI/GraphQL specs.
  - Implement defensive property access and explicit enum/date transformer functions.
- **Severity:** High

---

## FAI03: Async Race Conditions & Sequence Safety

- **Purpose:** Prevent out-of-order network responses from overwriting newer search, filter, or entity selections.
- **Detect:**
  - Search inputs or pagination controls dispatching asynchronous fetch requests without cancellation (`AbortController`) or sequence tokens.
  - Switching active tabs/entities rapidly where a slow initial request finishes after a fast subsequent request, rendering the wrong entity.
  - Missing request deduplication or debouncing on high-frequency UI events triggering concurrent identical requests.
- **Evidence:**
  - `onChange = (e) => api.get(`/items?q=${e.target.value}`).then(setItems)` where response order differs from user typing order.
  - Rapid click sequence: Tab 1 clicked (Req A), Tab 2 clicked (Req B); Req B resolves (Tab 2 shown), Req A resolves (Tab 1 incorrectly overwrites Tab 2 view).
- **Avoid:**
  - Flagging queries managed by libraries with built-in cancellation or sequence handling (e.g. TanStack Query `queryKey` invalidation, RTK Query).
- **Remediation:**
  - Pass an `AbortSignal` to cancel preceding in-flight requests on new input.
  - Track a monotonic request counter or timestamp ref and discard responses matching outdated sequence IDs.
- **Severity:** High

---

## FAI04: HTTP Status & Response Error Handling

- **Purpose:** Ensure non-2xx status codes, network drops, empty responses, and structured API error formats are handled correctly without presenting false success.
- **Detect:**
  - Calling `response.json()` on `204 No Content` or `304 Not Modified` responses, causing JSON parse syntax errors.
  - Inspecting `fetch()` without checking `response.ok`, treating 404 or 500 error bodies as successful business payloads.
  - Catch blocks that swallow API errors silently without updating error state or notifying the user.
  - Blindly assuming error payloads have a `.message` property, causing UI crashes on unexpected HTML error pages (e.g. 502 Bad Gateway).
- **Evidence:**
  - `const res = await fetch('/api/user'); const data = await res.json();` executing `data.map()` even when `res.status === 500`.
  - `response.json()` throwing `Unexpected end of JSON input` on `204 No Content` delete endpoint.
- **Avoid:**
  - Flagging centralized error interceptors or global error boundaries that intercept and format non-2xx responses upstream.
- **Remediation:**
  - Check `if (!response.ok)` before consuming response streams.
  - Check `response.status === 204` or `Content-Type` before calling `.json()`.
  - Provide typed error parsing with safe fallbacks for network drops or HTML error responses.
- **Severity:** High

---

## FAI05: Auth Boundaries & Token Lifecycle

- **Purpose:** Prevent unauthenticated API calls, concurrent token-refresh deadlocks, infinite 401 retry loops, and sensitive token leakage in query strings.
- **Detect:**
  - Exposing API keys or bearer tokens in query parameter strings instead of `Authorization` headers.
  - 401 response interceptor attempting token refresh without mutex/queue locking, triggering multiple concurrent refresh calls and invalidating refresh tokens.
  - 401 refresh handler retrying the original request on refresh failure, creating an infinite redirect/retry loop.
  - Forwarding authentication headers across untrusted third-party origins or external webhook URLs.
- **Evidence:**
  - Axios 401 interceptor calling `refreshToken()` concurrently on 5 parallel failed requests, causing token rotation invalidation.
  - Storing bearer tokens in plain URLs logged in browser history and server access logs (`/api/data?token=secret`).
- **Avoid:**
  - Flagging HttpOnly cookie-based session architectures where browser handles credentials automatically without JS token manipulation.
- **Remediation:**
  - Use a centralized token refresh mutex or promise queue to serialize concurrent refresh requests.
  - Break 401 retry loops by clearing auth state and redirecting to login on refresh failure.
  - Pass tokens strictly via `Authorization: Bearer <token>` headers.
- **Severity:** Critical

---

## FAI06: Mutation Semantics & Data Consistency

- **Purpose:** Prevent duplicate non-idempotent submissions, accidental overwrite of server state via partial objects, and inconsistent UI state on rejected mutations.
- **Detect:**
  - Mutation buttons (checkout, submit order) lacking disable/loading guards, allowing rapid double-clicks to dispatch duplicate `POST` mutations.
  - Using `PUT` with a partial payload object, unintentionally nullifying missing fields on full-replacement backend endpoints.
  - Updating optimistic UI state without an error rollback mechanism when the backend mutation rejects.
  - Missing idempotency keys on financial or order creation endpoints where required by API contract.
- **Evidence:**
  - Form submit handler sending non-idempotent `POST /orders` on every button click without disabling the submit button.
  - Optimistic item deletion remaining in UI after mutation receives `403 Forbidden` or `500 Internal Server Error`.
- **Avoid:**
  - Flagging PATCH requests that intentionally transmit partial change delta objects.
- **Remediation:**
  - Disable submit controls while mutation is in-flight, or enforce client-side debouncing / idempotency keys (`Idempotency-Key` header).
  - Snapshot previous state before optimistic updates and restore it inside `onError` handlers.
- **Severity:** High

---

## FAI07: Pagination, Filtering & Large Responses

- **Purpose:** Ensure paginated requests correctly track offsets, cursors, or page numbers, preserve search filters across pages, and terminate infinite loading.
- **Detect:**
  - Cursor-based or page-based pagination advancing the page index before confirming request success, causing skipped pages on error.
  - Changing filter/search criteria without resetting the page number to 1 or initial cursor, requesting nonexistent out-of-range pages.
  - Infinite scroll loops caused by missing termination conditions when `hasMore` or `nextCursor` is null/empty.
  - Concatenating paginated responses from different search queries into a single list.
- **Evidence:**
  - `loadMore()` incrementing `pageNumber` on click before the fetch resolves, leaving page state out of sync on network failure.
  - Infinite scroll handler continuously triggering `fetchNextPage()` when backend returns an empty items array.
- **Avoid:**
  - Flagging standard single-page endpoints or small fixed datasets where server-side pagination is neither supported nor needed.
- **Remediation:**
  - Advance pagination state only upon receiving valid page results.
  - Reset `pageIndex` / `cursor` to initial state whenever filter or query parameters change.
  - Check `items.length === 0` or `nextPageToken == null` before scheduling subsequent page fetches.
- **Severity:** Medium

---

## FAI08: Request Lifecycle & Abort Cleanup

- **Purpose:** Prevent unmounted or navigated-away components from triggering stale callbacks, leaking memory, or failing to abort obsolete HTTP connections.
- **Detect:**
  - `fetch` or Axios requests in component lifecycle hooks (`useEffect`, `onMounted`, Angular `OnInit`) missing cleanup functions to abort pending requests on unmount.
  - Unhandled promise resolution attempting to set component state after unmount, generating memory leak warnings.
  - Shared polling intervals or SSE/WebSocket connections failing to close when leaving the parent route.
- **Evidence:**
  - `useEffect(() => { fetchUser(id).then(setUser); }, [id]);` lacking `AbortController` cleanup on component unmount or ID switch.
  - Polling `setInterval(fetchStatus, 3000)` running indefinitely in background after navigating to another page.
- **Avoid:**
  - Flagging background service workers or singleton global sync services designed to persist across route transitions.
- **Remediation:**
  - Create an `AbortController` instance in the effect/lifecycle hook and call `controller.abort()` in the return/cleanup function.
  - Clear polling timers (`clearInterval`) and disconnect real-time streams upon unmounting.
- **Severity:** Medium

---

## FAI09: Cache Invalidation & Query Consistency

- **Purpose:** Ensure client-side API caches use complete cache keys reflecting all request parameters and invalidate or update cached queries upon mutation.
- **Detect:**
  - Cache keys omitting query parameters (e.g. caching `['users']` regardless of `page`, `filter`, or `sortBy`), serving incorrect cached data.
  - Mutation endpoints (e.g. `POST /todos`, `DELETE /items/:id`) succeeding without invalidating or updating the corresponding query cache keys.
  - Contradictory cache entries between single-item detail queries and list queries after an edit mutation.
- **Evidence:**
  - Query hook `useQuery(['users'], () => fetchUsers({ role, page }))` ignoring `role` and `page` in key array.
  - `createTodo` mutation resolving successfully but not calling `queryClient.invalidateQueries(['todos'])`, leaving stale list on screen.
- **Avoid:**
  - Flagging short-lived in-memory caches or read-only reference data where periodic background revalidation is sufficient.
- **Remediation:**
  - Include all dynamic query parameters in cache keys: `['users', { role, page }]`.
  - Invalidate dependent query keys in mutation `onSuccess` hooks, or perform direct cache updates with the mutation response payload.
- **Severity:** High

---

## FAI10: Interceptors & Shared Client Isolation

- **Purpose:** Prevent global HTTP interceptors and shared client instances from inadvertently mutating request configuration, dropping headers, or creating cross-tenant leakage.
- **Detect:**
  - Request interceptors mutating the shared `config.headers` object in-place across requests, contaminating subsequent calls with stale tenant/auth headers.
  - Response interceptors catching all errors and returning resolved promises with mock data, masking failures from downstream callers.
  - Registering HTTP interceptors inside component render functions or lifecycle hooks, multiplying interceptor execution on each render.
  - Retry interceptors retrying non-idempotent `POST` requests indefinitely without backoff or status code checks.
- **Evidence:**
  - `axios.interceptors.request.use(config => { config.headers['X-Request-ID'] = id; return config; })` modifying shared instance defaults.
  - Component calling `axios.interceptors.response.use(...)` inside `useEffect` without removing the interceptor on cleanup (`eject`).
- **Avoid:**
  - Flagging standard singleton API client configuration initialized once during application bootstrap.
- **Remediation:**
  - Clone request configuration headers before modifying: `headers: { ...config.headers, ...customHeaders }`.
  - Register interceptors exclusively during app startup, or store the interceptor ID and call `interceptors.eject(id)` on cleanup.
- **Severity:** High

