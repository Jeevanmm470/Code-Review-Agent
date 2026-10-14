---
name: skill-ui-custom-vanilla
description: >-
  Activate ONLY when authoring or reviewing framework-free JavaScript UI code involving native DOM manipulation,
  browser event handling, native form APIs, Fetch API, browser storage, ES modules, or native Web APIs.
  Do NOT activate for framework-managed UI code (React, Next.js, Angular, Vue) unless inspecting raw native browser APIs.
---

# Native Vanilla JavaScript & Browser Web APIs Skill

## 1. Purpose & Activation

Provides framework-independent technical guidance for native HTML, CSS, JavaScript, and browser Web API mechanics during frontend development and code review.

**Activate ONLY when** code changes involve direct DOM manipulation (`querySelector`, `innerHTML`, `textContent`), native event binding (`addEventListener`), `FormData`, `HTMLFormElement`, Constraint Validation API, `fetch()`, `localStorage`/`sessionStorage`, native ES modules, or Web APIs in vanilla JavaScript.

**Do NOT activate for** framework-managed component lifecycles (React, Angular, Vue), HTML accessibility (`skill-ui-html-accessibility`), CSS implementation (`skill-ui-css-standards`), general form workflows (`skill-ui-forms-and-validation`), or general performance principles (`skill-ui-performance-optimization`).

## 2. Core Rules Summary

| ID | Rule | Scope & Objective |
|---|---|---|
| VANILLA01 | Safe DOM Manipulation & Injection Prevention | Prefer `textContent` for plain text; sanitize untrusted input before using `innerHTML` or use safe DOM creation methods. |
| VANILLA02 | Event Delegation & Listener Lifecycle | Use direct listeners or event delegation appropriately; manage cleanup via `removeEventListener`, `AbortSignal`, or `{ once: true }`. |
| VANILLA03 | Plain JS State & UI Synchronization | Synchronize plain JavaScript state models predictably with DOM elements without stale or duplicate renders. |
| VANILLA04 | Constraint Validation & Native Forms | Leverage `HTMLFormElement`, `FormData`, and Constraint Validation API (`checkValidity`); use `preventDefault()` only when intercepting submission. |
| VANILLA05 | Fetch API & Asynchronous Network State | Check `response.ok` when status handling is required, handle network errors, and pass `AbortController` signal when cancellation is needed. |
| VANILLA06 | Safe Storage & Session Persistence | Access `localStorage`/`sessionStorage` safely for non-sensitive client state, adding quota/availability handling when functional state depends on it. |
| VANILLA07 | Module Isolation & Scope Management | Encapsulate code via ES modules (`type="module"`) or scoped scripts/IIFEs to avoid unmonitored global variable conflicts. |
| VANILLA08 | Feature Detection & API Compatibility | Verify modern Web API support using feature detection (`in`, `typeof`), polyfills, or progressive enhancement against target environments. |

## 3. Development Guidance

- **DOM Security**: Use `textContent` or `createElement` for text; sanitize dynamic HTML strings with an established sanitizer before setting `innerHTML`.
- **Event Binding**: Use direct listeners for fixed elements and delegation (`event.target.closest()`) for dynamic items. Detach via `removeEventListener` or `AbortSignal`.
- **Form Mechanics**: Intercept form `submit` via `e.preventDefault()` only for JS-managed submissions; construct `new FormData(form)` and validate via `form.checkValidity()`.
- **Fetch API**: Evaluate HTTP status codes (`response.ok`) when handling API response contracts; pass `signal` when request cancellation is functionally required.
- **Scope & Storage**: Isolate script variables using ES modules or function scopes; wrap storage calls in `try/catch` when handling critical local persistence.

## 4. Review Checks & Evidence Requirements

- **Evidence Requirement**: Cite: (1) exact file path and line number, (2) target browser API / JS implementation, (3) applicable rule, and (4) concrete failure scenario (e.g., untrusted data injection, listener memory leak, global namespace conflict).
- **DOM Injection**: Flag `innerHTML` usage only when dynamic data from untrusted sources is injected without sanitization.
- **Unchecked Fetch Status**: Flag `fetch()` calls that fail to inspect `response.ok` or status codes when response handling explicitly depends on HTTP success.
- **Scope Conflicts**: Flag top-level variable declarations or `window` mutations only when they create verifiable global namespace pollution or conflicts.

## 5. Common Anti-Patterns

- **Unsanitized innerHTML**: Injecting untrusted dynamic input directly into `innerHTML` instead of using `textContent` or safe DOM builders.
- **Ignored Fetch Error Status**: Assuming `fetch()` Promise rejection covers HTTP 4xx/5xx status codes without inspecting `response.ok`.
- **Unbounded Event Handlers**: Attaching repeated listeners to dynamic child elements without cleanup or delegation, leading to memory leaks.
- **Global Scope Pollution**: Declaring unencapsulated global variables in traditional scripts that overwrite or conflict with other modules.

## 6. False-Positive Safeguards

Do NOT flag:
- `innerHTML` usage when inserting static, hardcoded HTML or content already sanitized by a trusted model.
- Direct `addEventListener` calls on static elements, or missing `removeEventListener` when using `AbortSignal`, `{ once: true }`, or page-lifetime listeners.
- Native HTML form submissions that do not call `event.preventDefault()` when native navigation or submission is intended.
- `fetch()` calls without `AbortController` or explicit status checks when cancellation or status checks are not required by the feature context.
- Storage calls (`localStorage`/`sessionStorage`) for non-critical UI preferences or state without elaborate try/catch blocks.
- Non-module scripts or IIFEs unless actual global variable pollution or naming collisions exist.
- Modern Web APIs supported by target browser configurations or protected by feature detection (`typeof` / `'api' in window`).

## 7. Development & Review Checklist

- [ ] Used `textContent` or safe DOM methods for text nodes, or sanitized dynamic HTML before `innerHTML` insertion?
- [ ] Configured event listeners with direct binding, delegation, or cleanup mechanisms (`AbortSignal`, `removeEventListener`, `once`)?
- [ ] Intercepted form submit via `preventDefault()` only when JS interception is intended, leveraging `FormData` and `checkValidity()`?
- [ ] Handled `fetch()` status codes (`response.ok`) and network errors according to API contract requirements?
- [ ] Encapsulated script logic via ES modules, IIFEs, or local scopes to prevent global variable collisions?
