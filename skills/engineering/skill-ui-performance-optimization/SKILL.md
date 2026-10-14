---
name: skill-ui-performance-optimization
description: >-
  Activate ONLY when authoring or reviewing frontend code affecting browser rendering, layout recalculations, main thread execution,
  DOM manipulation, asset loading, network waterfall efficiency, DOM node retention, or Core Web Vitals (LCP, INP, CLS).
  Do NOT activate for backend performance, database queries, ORMs, general API logic, or non-UI code.
---

# UI Performance Optimization Engineering Skill

## 1. Purpose & Activation

Provides framework-independent engineering guidance for browser performance optimization during UI development and code review. Focuses on rendering pipelines, main-thread responsiveness, resource delivery, lifecycle memory management, and measurable Core Web Vitals.

**Activate ONLY when** code changes affect browser layout/paint cycles, main-thread blocking, DOM updates, image/font loading, code splitting, asset prioritization, or Core Web Vitals (LCP, INP, CLS).

**Do NOT activate for** general performance principles/scoring (`skill-eng-performance`), CSS layout correctness (`skill-ui-css-standards`), component architecture (`skill-ui-component-patterns`), or backend execution.

## 2. Core Rules Summary

| ID | Rule | Scope & Objective |
|---|---|---|
| UIPERF01 | Interleaved Layout & Composited Rendering | Eliminate repeated interleaved DOM read/write sequences causing forced layouts; prefer composited properties for animations. |
| UIPERF02 | Main-Thread Non-Blocking Execution | Yield long synchronous tasks and coordinate high-frequency handlers (via rAF, throttling, or debouncing) when execution impacts responsiveness. |
| UIPERF03 | Critical Asset & Resource Delivery | Prioritize resources critical to initial render and LCP; lazy-load non-critical below-the-fold assets appropriately. |
| UIPERF04 | Bundle Optimization & Code Splitting | Apply route/feature code splitting and dynamic imports to minimize initial JavaScript/CSS payload transfer sizes. |
| UIPERF05 | Lifecycle Resource Teardown | Release event listeners, observers, timers, and references when their lifecycle outlives the active UI view. |
| UIPERF06 | Efficient DOM Node Rendering | Employ virtualized, paginated, or incremental rendering for large or complex data collections when rendering cost impacts frame rates. |
| UIPERF07 | Network Waterfall & Request Efficiency | Eliminate avoidable sequential fetch cascades, duplicate network requests, and uncoordinated asset calls. |
| UIPERF08 | Core Web Vitals & Measurement Evidence | Base performance findings on DevTools profiles, RUM data, or concrete execution behavior rather than static assumption. |

## 3. Development Guidance

- **Rendering Pipeline**: Separate DOM geometry reads from style writes to prevent forced layout thrashing; animate composited properties (`transform`, `opacity`) where suitable.
- **Main-Thread Responsiveness**: Yield execution during heavy computations; apply scheduling (`rAF`), throttling, debouncing, or Web Workers for complex handlers.
- **Resource Prioritization**: Ensure primary LCP assets load eagerly while lazy-loading non-critical below-the-fold resources; configure `font-display: swap`.
- **Lifecycle Teardown**: Clean up global window listeners, observers (`ResizeObserver`), and timers upon UI removal unless handled by `AbortSignal` or `{ once: true }`.
- **Data Rendering**: Use virtualization or pagination for data collections when DOM node density or updates cause measurable frame drops.

## 4. Review Checks & Evidence Requirements

- **Evidence Requirement**: Verify: (1) exact file path and line number, (2) applicable UIPERF rule, (3) execution or loading path, (4) concrete evidence of forced layout thrashing, main-thread blocking, or resource retention, and (5) existing browser/framework optimizations. Distinguish confirmed defects from speculative risks requiring profiling.
- **Forced Synchronous Layout**: Flag repeated interleaved geometry reads (`offsetWidth`) and writes within loops or high-frequency callbacks.
- **Dangling External Listeners**: Flag global window/document event listeners or observers attached without teardown when their lifecycle exceeds the component.
- **Unbounded DOM Bloat**: Flag direct DOM rendering of extensive data structures where node count or update frequency causes visible rendering lag.

## 5. Common Anti-Patterns

- **Interleaved Read/Write Loops**: Alternating DOM measurements and style assignments inside iteration loops (`elem.style.width = elem.offsetWidth + 'px'`).
- **Heavy Unscheduled Event Handlers**: Performing expensive layout or data calculations directly inside high-frequency `scroll` or `resize` callbacks.
- **Lazy-Loading LCP Critical Hero**: Applying `loading="lazy"` to above-the-fold primary hero images, delaying Largest Contentful Paint.
- **Unreleased Global Observers**: Failing to disconnect `ResizeObserver` or window listeners when destroying dynamic UI views.

## 6. False-Positive Safeguards

Do NOT flag:
- Isolated synchronous layout measurements (`offsetWidth`, `getBoundingClientRect`) or valid DOM reads without interleaved writes.
- Lightweight or direct event handlers where execution cost is trivial or immediate user feedback is required.
- Small or efficiently rendered lists without demonstrated rendering lag or DOM bloat.
- Eagerly loaded above-the-fold images or fonts that participate in critical initial rendering.
- Listeners cleaned up automatically by framework lifecycle, `{ once: true }`, `AbortSignal`, or DOM element destruction.
- Micro-optimizations or speculative Core Web Vitals regressions without profiling or resource transfer evidence.

## 7. Development & Review Checklist

- [ ] Separated DOM geometry reads from writes to avoid forced layout thrashing?
- [ ] Coordinated heavy event handlers via scheduling, throttling, or debouncing where complexity affects responsiveness?
- [ ] Prioritized critical LCP assets while lazy-loading non-critical below-the-fold resources?
- [ ] Cleaned up global listeners, observers, and timers whose lifecycle outlives the UI component?
- [ ] Virtualized or paginated large DOM structures when rendering density impacts frame rates?
