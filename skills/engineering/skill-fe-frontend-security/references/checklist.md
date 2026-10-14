# Frontend Security Inspection Checklist

This checklist defines review criteria, detection heuristics, evidence patterns, anti-patterns, remediation strategies, and default severities for rules `FSEC01` through `FSEC10`.

---

## FSEC01: Unsafe HTML Rendering & Dangerous DOM Sinks

- **Purpose:** Prevent Reflected, Stored, and DOM-based Cross-Site Scripting (XSS) by eliminating unsanitized direct HTML injection and dangerous DOM sink manipulations.
- **Detect:**
  - Direct use of framework escape hatches: React `dangerouslySetInnerHTML`, Vue `v-html`, Angular `bypassSecurityTrustHtml`/`bypassSecurityTrustScript`, Svelte `{@html ...}`, Blazor `(MarkupString)`.
  - Direct manipulation of dangerous browser DOM properties: `element.innerHTML`, `element.outerHTML`, `document.write()`, `document.writeln()`, or `eval()`.
  - Rendering user-supplied markdown or rich text without passing it through a dedicated, secure HTML sanitizer (e.g. DOMPurify).
- **Evidence:**
  - `<div dangerouslySetInnerHTML={{ __html: queryParam }} />` or `<div v-html="untrustedContent"></div>` without wrapping in sanitization logic.
  - Angular service explicitly bypassing security: `this.sanitizer.bypassSecurityTrustHtml(userHtml)`.
- **Avoid:**
  - Flagging standard framework text interpolation (e.g. `{userName}`, `{{item.title}}`) which automatically encodes HTML entities.
  - Flagging `dangerouslySetInnerHTML` when the input is sanitized via `DOMPurify.sanitize(input)`.
- **Remediation:**
  - Replace raw HTML injection with safe text interpolation where markup is not required.
  - If rich HTML rendering is necessary, sanitize the HTML string using `DOMPurify.sanitize(dirtyHtml, { USE_PROFILES: { html: true } })`.
- **Severity:** Critical

---

## FSEC02: Dangerous URL Schemes & Client Open Redirects

- **Purpose:** Prevent execution of malicious script payloads via pseudo-protocols (`javascript:`, `data:`, `vbscript:`) and unvalidated client-side open redirects.
- **Detect:**
  - Dynamically bound anchor tags `<a href={userUrl}>` or `<iframe src={untrustedSrc}>` where `userUrl` can contain `javascript:...`.
  - Programmatic navigation via `window.location.href = redirectUrl`, `router.push(queryParam)`, or `window.open(url)` without scheme or domain validation.
  - Opening new tabs with `target="_blank"` without setting `rel="noopener noreferrer"` on untrusted external links (preventing `window.opener` reverse tabnabbing).
- **Evidence:**
  - `<a href={profile.websiteUrl}>Website</a>` where `websiteUrl` is not validated against an allowed protocol whitelist (`http:`, `https:`).
  - `const redirect = new URLSearchParams(window.location.search).get('returnUrl'); window.location.href = redirect;`
- **Avoid:**
  - Flagging internal application routes (e.g. `router.push('/dashboard')` or relative paths starting with `/` validated against `^/(?!\/)`).
- **Remediation:**
  - Validate that URLs use approved protocols: `const isSafe = /^https?:\/\//i.test(url) || url.startsWith('/');`.
  - Sanitize redirect URLs by strictly checking that the destination hostname matches an allowed domain list before assigning to `window.location`.
- **Severity:** High

---

## FSEC03: Client-Side Secrets & Sensitive Build Artifacts

- **Purpose:** Prevent embedding private credentials, backend API keys, signing secrets, and database connection strings into public frontend bundles.
- **Detect:**
  - Hardcoded private keys, JWT signing secrets, service role API keys (e.g. Supabase service role key, Stripe private key `sk_live_*`, AWS secret access key) in frontend source files.
  - Exposing secret environment variables to client build tools by prefixing them with public prefixes (e.g. `REACT_APP_`, `VITE_`, `NEXT_PUBLIC_`, `NUXT_PUBLIC_`).
  - Including private credentials in frontend `.env` template files bundled into static assets.
- **Evidence:**
  - `const STRIPE_SECRET = "sk_live_..."` or `process.env.NEXT_PUBLIC_AWS_SECRET_KEY` inside client component code.
- **Avoid:**
  - Flagging public client identifiers intended for browser use (e.g. Stripe publishable keys `pk_live_*`, Firebase public apiKey, Google Analytics IDs).
- **Remediation:**
  - Move secret-dependent operations to backend server endpoints or API routes.
  - Ensure client build configurations only expose non-sensitive public configuration variables.
- **Severity:** Critical

---

## FSEC04: Insecure Client Token Handling & Session State

- **Purpose:** Protect authentication tokens, session credentials, and OAuth tokens from client-side script theft, URL leakage, and session persistence flaws.
- **Detect:**
  - Storing highly sensitive refresh tokens or persistent auth credentials in `localStorage` where any XSS vulnerability can exfiltrate them.
  - Appending raw access tokens or session IDs into URL query parameters where they are leaked via Referer headers or browser history.
  - Incomplete logout routines that fail to clear client-stored tokens and cached user profiles from memory and storage upon user logout.
- **Evidence:**
  - `localStorage.setItem('auth_token', token)` in an application handling high-security financial/healthcare data without HttpOnly cookie options.
  - `window.location.href = `/api/download?token=${accessToken}`` leaking token to third-party endpoints or logs.
- **Avoid:**
  - Flagging standard Single Page Application (SPA) in-memory token state or low-risk token handling when HttpOnly cookies are used for session authentication.
- **Remediation:**
  - Prefer server-set `HttpOnly`, `Secure`, `SameSite=Lax/Strict` cookies for storing authentication session state.
  - If client tokens are necessary, maintain them in memory (closure/state) and ensure comprehensive cleanup on logout (`storage.clear()`, state reset).
- **Severity:** High

---

## FSEC05: Client-Side Only Authorization & False Boundaries

- **Purpose:** Prevent treating client-side UI visibility or disabled attributes as authoritative security boundaries for sensitive data or operations.
- **Detect:**
  - Relying exclusively on UI hiding (`isAdmin ? <AdminPanel /> : null`) without corresponding backend authorization checks on invoked APIs.
  - Passing client-controlled user IDs, roles, or tenant IDs in API request bodies without server-side validation against the authenticated token context.
  - Fetching complete privileged datasets and filtering unauthorized records client-side in JavaScript before rendering.
- **Evidence:**
  - `const users = await fetch('/api/all-users'); const visibleUsers = users.filter(u => u.tenantId === currentTenantId);`
  - Unauthenticated client triggering `/api/admin/delete-database` because UI only checks `user.role === 'admin'`.
- **Avoid:**
  - Flagging UI role checks that provide visual user experience customization when the backend demonstrably enforces authoritative permissions.
- **Remediation:**
  - Document that frontend permission checks are strictly cosmetic; ensure all API endpoints independently verify caller authorization and tenant boundaries.
  - Filter and authorize data exclusively on the backend prior to returning API responses.
- **Severity:** High

---

## FSEC06: Cross-Origin Request Safety & Client CSRF Misconfiguration

- **Purpose:** Ensure cross-origin API requests, cookie attachments, and state-changing client operations do not expose users to CSRF or cross-origin data leakage.
- **Detect:**
  - State-changing client requests (`POST`, `PUT`, `DELETE`) relying solely on ambient browser cookies without including custom anti-CSRF headers (e.g. `X-CSRF-Token`, `X-Requested-With`).
  - Configuring client `fetch` or `axios` with `credentials: 'include'` / `withCredentials: true` when communicating with untrusted or wildcard third-party origins.
  - Insecure client handling of OAuth redirect callbacks that skips verifying the `state` parameter against local cryptographic state.
- **Evidence:**
  - Client state modification form posting directly to cookie-authenticated endpoint without CSRF token or anti-forgery headers.
  - OAuth login callback processing `code` parameter without comparing returned `state` against stored `oauth_state`.
- **Avoid:**
  - Flagging API requests authenticated via `Authorization: Bearer <token>` headers (which are inherently immune to standard cookie-based CSRF).
- **Remediation:**
  - Include custom anti-CSRF request headers on cookie-authenticated mutations.
  - Validate OAuth `state` parameters strictly before exchanging authorization codes for tokens.
- **Severity:** High

---

## FSEC07: Unsafe Browser Messaging & Cross-Origin postMessage

- **Purpose:** Ensure browser-to-browser and iframe communications using `window.postMessage` validate sender origins and do not broadcast sensitive data to arbitrary origins.
- **Detect:**
  - `window.addEventListener('message', ...)` message handlers that do not verify `event.origin` against a trusted whitelist of origins.
  - Executing code or mutating state directly based on `event.data` without origin verification and schema validation.
  - Invoking `targetWindow.postMessage(sensitiveData, '*')` with wildcard target origin `*`.
- **Evidence:**
  - `window.addEventListener('message', (e) => { eval(e.data.code); });` without `if (e.origin !== 'https://trusted.example.com') return;`.
  - `iframe.contentWindow.postMessage({ authToken: token }, '*');`.
- **Avoid:**
  - Flagging postMessage handlers that explicitly check `event.origin === EXPECTED_ORIGIN` and parse typed payloads safely.
- **Remediation:**
  - Always verify `event.origin` against an explicit whitelist before processing received message events.
  - Specify the exact target origin when posting messages (`targetWindow.postMessage(payload, 'https://app.example.com')`).
- **Severity:** High

---

## FSEC08: Dynamic Script Injection & Third-Party Integrity

- **Purpose:** Prevent execution of malicious third-party scripts, untrusted dynamic script tags, and unverified external CDN dependencies.
- **Detect:**
  - Dynamically creating `<script>` elements with `src` constructed from untrusted or user-supplied URLs.
  - Loading external JavaScript or CSS stylesheets from third-party CDNs without `integrity` (Subresource Integrity - SRI) and `crossorigin` attributes.
  - Using `eval()`, `new Function()`, or `setTimeout("string", ...)` with dynamically constructed strings.
- **Evidence:**
  - `const s = document.createElement('script'); s.src = userScriptUrl; document.head.appendChild(s);`.
  - `<script src="https://cdn.example.com/lib.js"></script>` in public deployment without `integrity="sha384-..."`.
- **Avoid:**
  - Flagging standard static module bundler imports (`import('./module')`) resolved within local repository build paths.
- **Remediation:**
  - Disallow dynamic script loading from arbitrary external URLs.
  - Add cryptographic Subresource Integrity (SRI) hashes and `crossorigin="anonymous"` to external CDN script tags.
- **Severity:** High

---

## FSEC09: Sensitive Data Exposure in Browser Storage

- **Purpose:** Prevent exposing unencrypted personally identifiable information (PII), payment card data, plaintext passwords, or health records in persistent browser storage.
- **Detect:**
  - Storing user passwords, PINs, credit card numbers, or sensitive government IDs in `localStorage`, `sessionStorage`, or unencrypted `IndexedDB`.
  - Retaining cached user profile data across account switching or public kiosk sessions without cache eviction.
  - Storing sensitive application secrets in unencrypted service worker caches.
- **Evidence:**
  - `localStorage.setItem('user_credit_card', cardDetails.number);`.
  - Persisting unencrypted medical records in `localStorage` across user sessions.
- **Avoid:**
  - Flagging storage of non-sensitive UI preferences (theme, language, layout state) in `localStorage`.
- **Remediation:**
  - Avoid persisting sensitive PII or credentials in browser storage; keep sensitive data strictly in transient component memory.
  - Clear all persistent application state and caches during logout workflows.
- **Severity:** Medium

---

## FSEC10: Insecure Frontend Configuration & Debug Exposure

- **Purpose:** Prevent exposing development debug endpoints, test harnesses, administrative backdoors, or diagnostic source maps in production client builds.
- **Detect:**
  - Exposing global window debug hooks (e.g. `window.__DEBUG_ADMIN__ = true`, `window.__SET_USER_ROLE = ...`) in production bundles.
  - Hardcoded development bypass flags or mock authentication endpoints active in production mode.
  - Publicly accessible development test routes or mock data injectors left enabled in client routers.
- **Evidence:**
  - `if (window.__DEV__ || true) { window.bypassAuth = () => setToken('fake_admin_token'); }`.
  - Client router including `/test-admin-backdoor` route without build-time tree-shaking (`process.env.NODE_ENV === 'development'`).
- **Avoid:**
  - Flagging standard development-only logging guarded by build-time constants (e.g. `if (process.env.NODE_ENV !== 'production') console.log(...)`).
- **Remediation:**
  - Guard development tools and test routes with compile-time conditional flags (`process.env.NODE_ENV === 'development'`) to ensure dead-code elimination in production.
  - Strip global debug helpers from production bundle builds.
- **Severity:** Medium

