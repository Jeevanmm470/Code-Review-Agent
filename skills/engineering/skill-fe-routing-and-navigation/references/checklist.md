# Frontend Routing and Navigation Review Checklist

## FRN01: Route Definitions and Matching Precedence

- **Rule ID**: `FRN01`
- **Purpose**: Prevent route shadowing, incorrect route prioritization, and unreachable endpoints caused by ambiguous route definitions or misordered wildcards.
- **Severity**: HIGH
- **Applicability**: All client-side routing definitions across React Router, Vue Router, Angular Router, TanStack Router, and Blazor routing.

### What to Detect
- Catch-all/wildcard routes (`*`, `/:pathMatch(.*)*`, `**`) placed before specific static or parameterized routes in sequential-matching routers.
- Overlapping route paths where parameterized segments shadow static sibling routes (e.g., `/users/:id` declared above `/users/new` in top-to-bottom routers).
- Ambiguous route definitions with duplicate path patterns leading to non-deterministic route resolution.
- Undefined default or index routes for nested layouts causing blank views when navigating to parent paths.

### Evidence Requirements
- **Required**: The route configuration file showing the misordered or conflicting route definitions.
- **Required**: Specific line numbers of the shadowing pattern and the shadowed route.
- **Required**: Explanation of which incoming URL path will trigger the incorrect route component.

### What to Avoid (False Positives)
- Do NOT flag route order in modern routers that implement ranked score-based matching (e.g., TanStack Router, React Router v6+) unless an explicit ambiguity or overlapping conflict is verified.
- Do NOT flag dynamic segments where distinct regex or parameter constraints prevent collision (e.g., `:id(\\d+)` vs `:slug([a-z]+)`).
- Do NOT flag catch-all routes placed at the root level as a 404 handler when positioned as the final child route.

### Remediation Guidance
- Reorder route declarations so that static, specific paths precede parameterized dynamic paths, and catch-all wildcards (`*`) appear strictly last.
- Use explicit path constraints, nested route hierarchies, or regex matching guards where supported by the framework.

---

## FRN02: Navigation Targets and Dynamic Parameter Encoding

- **Rule ID**: `FRN02`
- **Purpose**: Prevent broken navigations, malformed URLs, and routing failures caused by unencoded dynamic parameters or unvalidated navigation target paths.
- **Severity**: HIGH
- **Applicability**: Route parameter generation, programmatic navigation, link component attributes (`href`, `to`, `routerLink`).

### What to Detect
- Dynamic URL segment concatenation using raw string interpolation without URI component encoding (`encodeURIComponent`) when variables may contain slashes, spaces, hashes, or query delimiters (`/users/${userProvidedString}`).
- Navigation calls passing `undefined`, `null`, or empty string parameter values resulting in literal `/users/undefined` routes.
- Links referencing hardcoded relative paths without proper base URL resolution, causing route drift during deep navigation.
- Unsanitized user inputs fed directly into client-side redirect destinations without route allowlist validation.

### Evidence Requirements
- **Required**: The template or navigation call constructing the URL target.
- **Required**: The source of dynamic parameters showing missing encoding or missing null/undefined validation checks.
- **Required**: Example of problematic input value (e.g., `user/name` containing `/` or `#`) breaking route parsing.

### What to Avoid (False Positives)
- Do NOT flag framework router helpers that automatically encode route parameter objects (e.g., `router.push({ name: 'user', params: { id } })`).
- Do NOT flag strictly typed internal identifier variables known to be numeric (`userId: number`) or sanitized UUIDs.
- Do NOT flag static string literal navigation targets.

### Remediation Guidance
- Ensure dynamic path values constructed via string interpolation wrap variable segments in `encodeURIComponent(param)`.
- Use structured route target objects (e.g., `{ name: 'Profile', params: { id } }`) rather than raw string interpolation.
- Add validation or default fallbacks before navigating to guard against `undefined` or `null` parameter values.

---

## FRN03: URL State and Component Synchronization

- **Rule ID**: `FRN03`
- **Purpose**: Prevent stale UI state, orphaned component lifecycles, and desynchronization when navigating between routes sharing the same component instance with different route parameters.
- **Severity**: HIGH
- **Applicability**: Route-driven component lifecycles, route parameter listeners, and reactive component state.

### What to Detect
- Component state initialized only once in mount hooks (`useEffect(..., [])`, `ngOnInit()`, `mounted()`) relying on route parameters without observing subsequent parameter updates.
- Failure to re-fetch data or reset form/modal state when route parameters change while the component remains mounted.
- Storing primary view entity IDs in local state while ignoring incoming URL changes from browser navigation or sibling links.
- Components mutating URL parameters without listening to `popstate` or router events to synchronize internal display.

### Evidence Requirements
- **Required**: The component lifecycle or hook showing one-time initialization with route params.
- **Required**: Absence of route parameter dependencies in effect dependency arrays or subscription teardowns.
- **Required**: Specific user flow where navigating between two entities (e.g., `/items/1` -> `/items/2`) leaves the view showing stale item 1 data.

### What to Avoid (False Positives)
- Do NOT flag components that re-mount entirely upon route change due to keying strategies (`key={location.pathname}`).
- Do NOT flag route components utilizing framework loader data that triggers complete component re-evaluation.
- Do NOT flag transient non-entity UI state (e.g., dropdown expanded state, hovered row) that does not depend on URL parameters.

### Remediation Guidance
- Include route parameters (`useParams()`, `route.params`, `$route.params`) in reactive effect dependencies or route watch subscriptions.
- Reset local state or trigger data refetches whenever route parameter observables emit new values.
- Apply unique key props based on entity IDs at the route outlet or component container level if full remounting is desired.

---

## FRN04: Query Parameters and Search Params Handling

- **Rule ID**: `FRN04`
- **Purpose**: Prevent loss of query parameters during navigation, race conditions in search filter updates, and type-coercion bugs in search param parsing.
- **Severity**: MEDIUM
- **Applicability**: Search parameters, filter bars, pagination controls, and query string state management.

### What to Detect
- Programmatic navigation overwriting the entire query string and stripping existing filters/search parameters when updating a single query key.
- Unsanitized parsing of query string values assuming non-array types when duplicate keys can be present (`?tag=a&tag=b`).
- Storing numeric or boolean query params without proper type parsing/coercion, leading to `'false' === true` or `'0'` truthiness defects.
- Repeated rapid updates to `setSearchParams` without functional updater callbacks leading to lost parameter updates in race conditions.

### Evidence Requirements
- **Required**: The query parameter parsing or modification logic.
- **Required**: The navigation or state update call demonstrating parameter wiping or type mishandling.
- **Required**: Concrete failure scenario (e.g., changing page wipes active filters `?search=term&page=2` -> `?page=2`).

### What to Avoid (False Positives)
- Do NOT flag intentional query parameter resets (e.g., "Clear All Filters" buttons explicitly passing an empty query object).
- Do NOT flag schema-validated query parameter parsers (e.g., `zod`, `valibot`, `type-safe-search-params`) with explicit defaults.
- Do NOT flag transient form input state before form submission where query params are updated upon submit.

### Remediation Guidance
- Preserve existing search parameters when updating individual keys by merging with current `URLSearchParams` or route query objects.
- Use schema validation or explicit parsing (`Number()`, `Boolean()`) for non-string query parameters.
- Use functional update forms (`setSearchParams(prev => ... )`) to prevent race conditions during rapid multi-parameter updates.

---

## FRN05: Browser History and Navigation Semantics

- **Rule ID**: `FRN05`
- **Purpose**: Prevent broken browser back/forward navigation, history stack pollution, and inappropriate history replacement actions.
- **Severity**: MEDIUM
- **Applicability**: Navigation methods (`push`, `replace`, `go`, `back`), link elements, tab switches, and redirect flows.

### What to Detect
- High-frequency UI interactions (e.g., live keystroke search inputs, sliders, accordion toggles) executing `history.push` on every event, cluttering history stack and breaking the Back button.
- Authentication redirect guards and login hops using `push` instead of `replace`, trapping users in back-button redirect loops.
- Semantic navigation links rendered as `<button onClick={() => navigate(...)}>` or `<div>` without accessible `<a>` elements for primary navigation.
- Inappropriate use of `replace: true` for primary user navigation flows, unexpectedly wiping user navigation history.

### Evidence Requirements
- **Required**: The event handler or redirect logic performing the history navigation.
- **Required**: The specific option (`pushState` vs `replaceState` or `navigate(..., { replace: true })`).
- **Required**: Explanation of how the history stack is compromised or how back-button navigation is impaired.

### What to Avoid (False Positives)
- Do NOT flag debounced search inputs that update query parameters with `{ replace: true }`.
- Do NOT flag programmatic navigation triggered by legitimate form submit actions or multi-step wizard step advances.
- Do NOT flag modal dialog open/close states managed through history where forward/back navigation is an intended feature.

### Remediation Guidance
- Use `{ replace: true }` for live search filtering, pagination updates, and authentication gate redirects.
- Use standard `<Link>` or `<a>` components with valid `href`/`to` attributes for primary navigation rather than click-handler divs.
- Preserve history stack integrity by reserving `push` for discrete, distinct user navigation milestones.

---

## FRN06: Deep Linking and Direct URL Restoration

- **Rule ID**: `FRN06`
- **Purpose**: Ensure all route views can be loaded directly from a refreshed browser tab, external deep link, or shared URL without requiring prior in-memory application state.
- **Severity**: HIGH
- **Applicability**: Deep linking, direct URL entry, page reloads, and route initialization.

### What to Detect
- Route components throwing errors or displaying empty screens when accessed directly because essential state is only passed via router location state (`history.state` / `location.state`) without URL fallback.
- Child or detail views that cannot load without navigating through parent list views first due to reliance on client-side memory stores.
- Master-detail views where the selected ID is stored strictly in memory without being reflected in the URL path or search parameters.
- Protected routes failing on refresh because authentication token verification or tenant context initialization does not trigger on direct load.

### Evidence Requirements
- **Required**: The component reading `location.state` or in-memory store without fetching fallback data when the state is null/undefined.
- **Required**: The route path showing parameters that should represent the required resource.
- **Required**: Walkthrough of direct browser URL entry reproducing the blank view or unhandled exception.

### What to Avoid (False Positives)
- Do NOT flag optional performance optimizations where `location.state` provides instant cache data while background fetch updates the view.
- Do NOT flag checkout or multi-step wizard transition states explicitly documented as non-bookmarkable temporary steps with proper redirect fallbacks.
- Do NOT flag deep links properly guarded by loading states while initial asynchronous tenant/session bootstrap executes.

### Remediation Guidance
- Design route views to retrieve their primary entity based on URL route parameters (`/items/:id`) rather than assuming `location.state` is populated.
- When `location.state` is missing upon page reload, trigger an API fetch using the URL parameters or gracefully redirect back to the parent list.
- Keep bookmarkable view states (active tab, search query, page number) synchronized with URL search params.

---

## FRN07: Auth Guards and Protected Route Redirects

- **Rule ID**: `FRN07`
- **Purpose**: Prevent unauthorized route exposure, unhandled unauthenticated states, missing return-URL preservation, and infinite redirect loops.
- **Severity**: CRITICAL
- **Applicability**: Route authentication guards, protected route wrappers, redirect resolvers, and authorization middlewares.

### What to Detect
- Protected route guards that render protected child components before authentication status finishes initializing (loading/unresolved state).
- Authentication redirects that do not preserve the originally requested URL (`returnUrl` / `from`), redirecting users to the root dashboard instead of the target page after login.
- Infinite redirect loops where login/error pages are inadvertently placed inside protected route layouts or redirect conditions cycle mutually.
- Authorization checks validating only authentication (logged in) but ignoring role/permission claims, allowing unauthorized route rendering.

### Evidence Requirements
- **Required**: The route guard component or middleware definition.
- **Required**: The check evaluating user auth state, showing premature rendering during loading or missing `returnUrl` capture.
- **Required**: Failure trajectory (e.g., unauthenticated user accessing `/admin` sees momentary flash of admin data or gets trapped in loop).

### What to Avoid (False Positives)
- Do NOT flag route guards that render dedicated loading spinners while auth session validation is pending.
- Do NOT flag public routes (e.g., `/login`, `/register`, `/forgot-password`, `/status`) intentionally excluded from auth guard wrappers.
- Do NOT flag backend API authorization checks; focus review on client-side route guard correctness and UX redirects.

### Remediation Guidance
- Render a loading fallback while authentication initialization is in progress; do not render protected outlets until status is resolved.
- Pass the current `location.pathname + location.search` as a redirect state or query parameter when redirecting to login (`/login?returnUrl=...`).
- Exclude login, signup, and public fallback routes from protected layout wrappers to eliminate infinite redirect loops.

---

## FRN08: Nested Routes, Layouts, and Outlet Boundaries

- **Rule ID**: `FRN08`
- **Purpose**: Prevent broken view hierarchies, missing layout child views, and orphaned routes in nested routing architectures.
- **Severity**: HIGH
- **Applicability**: Nested route structures, layout components, `<Outlet />`, `<router-outlet>`, and `<router-view>`.

### What to Detect
- Layout components defining nested child routes in route configuration but omitting the outlet component (`<Outlet />`, `<router-outlet>`, `<router-view>`) in their JSX/template.
- Misplaced child route paths using absolute leading slashes (`/child`) in frameworks where leading slashes reset route path nesting to the root.
- Parent routes rendering static wrapper content that unconditionally hides or overlays child route outlets.
- Deeply nested route boundaries missing index route definitions, resulting in empty layouts when navigating to the parent path.

### Evidence Requirements
- **Required**: The layout component code showing the missing outlet tag or misplaced container.
- **Required**: The route configuration declaring child routes under the affected layout.
- **Required**: Description of how child routes fail to render on navigation.

### What to Avoid (False Positives)
- Do NOT flag leaf routes or standalone page components that do not have nested child routes.
- Do NOT flag modern routers where route path strings natively support root-relative paths without breaking parent layout hierarchy.
- Do NOT flag layout components that conditionally switch between child outlets and full-page overlays based on explicit modal route patterns.

### Remediation Guidance
- Ensure every parent layout component configured with child routes includes the framework's outlet component (`<Outlet />` in React Router, `<router-view />` in Vue, `<router-outlet></router-outlet>` in Angular).
- Use relative path segments for child routes in nested configurations unless absolute root matching is explicitly intended.
- Provide an index route (`<Route index element={<DefaultDashboard />} />`) for parent layouts to handle base path visits.

---

## FRN09: Route-Level Data Loading and Race Conditions

- **Rule ID**: `FRN09`
- **Purpose**: Prevent UI race conditions, memory leaks, and stale data display caused by asynchronous route loaders or uncancelled data fetches during route transitions.
- **Severity**: HIGH
- **Applicability**: Route loaders, data-fetching hooks attached to route changes, and asynchronous route resolvers.

### What to Detect
- Route-triggered API calls that do not implement cancellation (`AbortController`, unsubscribes) when the user rapidly changes routes or route parameters.
- Out-of-order promise resolutions where a slower fetch from a previous route param (`/users/1`) resolves after a faster fetch for a newer param (`/users/2`), overwriting modern state with stale data.
- Route transition loaders that hang indefinitely without error boundaries or timeout handling when an API endpoint fails or stalls.
- Data fetching initiated in components without cleanup functions on unmount.

### Evidence Requirements
- **Required**: The data-fetching effect or loader function tied to route params.
- **Required**: The absence of abort signals, cancellation checks, or active-flag checks.
- **Required**: Scenario showing rapid route changes leading to stale data overwriting newer data.

### What to Avoid (False Positives)
- Do NOT flag data fetching handled by query client libraries (e.g., TanStack Query, RTK Query, SWR) that automatically manage query keys, cancellation, and deduplication.
- Do NOT flag framework route loaders (e.g., Remix / React Router 6.4+ `loader`) that natively cancel stale requests on navigation.
- Do NOT flag synchronous or cached in-memory lookups.

### Remediation Guidance
- Use `AbortController` and pass `signal` to fetch calls within route-dependent effects, aborting previous requests in cleanup handlers.
- Use boolean active flags (`let isMounted = true; ... return () => { isMounted = false; }`) in lifecycle hooks to ignore out-of-order resolutions.
- Leverage robust route data loading mechanisms (framework loaders or query libraries with route-param cache keys).

---

## FRN10: Route Fallbacks and 404 Error Boundaries

- **Rule ID**: `FRN10`
- **Purpose**: Prevent blank screens, unhandled client-side exceptions, and dead-end user experiences when users navigate to non-existent routes or invalid dynamic parameters.
- **Severity**: MEDIUM
- **Applicability**: Wildcard fallback routes, route-level error boundaries, 404 components, and invalid route parameter handling.

### What to Detect
- Entire router configurations lacking a catch-all (`*` or `**`) 404 route fallback, causing blank pages on unknown URLs.
- Route error boundaries missing at the root or layout level, causing entire application crashes when a child route loader or component throws.
- Dynamic route components failing to handle invalid or non-existent entity IDs (e.g., `/items/invalid-id`) without rendering a 404/not-found state or redirecting.
- Generic fallback components that do not provide navigation actions (e.g., "Return to Home" button) trapping users in a dead end.

### Evidence Requirements
- **Required**: The router configuration or root layout showing missing fallback or error boundary components.
- **Required**: Code in dynamic route component where failed entity lookups cause unhandled null reference exceptions.
- **Required**: Step-by-step navigation path demonstrating the blank screen or fatal unhandled error.

### What to Avoid (False Positives)
- Do NOT flag routers where server-side routing handles 404 responses before client-side hydration.
- Do NOT flag applications with centralized global error boundaries wrapped around the router container.
- Do NOT flag nested routes that inherit catch-all handlers from ancestor router configurations.

### Remediation Guidance
- Add an explicit catch-all route (`<Route path="*" element={<NotFoundPage />} />`) at the root level of client-side route configurations.
- Attach route-level error boundaries (`errorElement={<RouteErrorBoundary />}`) to catch unexpected loader or rendering failures.
- In dynamic entity routes, check if the fetched entity is null/undefined and render a dedicated `<NotFound />` component with recovery links.

