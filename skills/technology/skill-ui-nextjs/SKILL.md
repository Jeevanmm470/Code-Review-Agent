---
name: skill-ui-nextjs
description: >-
  Activate ONLY when developing or reviewing Next.js UI code involving App Router or Pages Router, Server/Client
  component boundaries, rendering strategies, Next.js fetch caching, Server Actions, route handlers, or Next.js config.
  Do NOT activate for vanilla React components, CSS, or non-Next.js code without Next.js framework specifics.
---

# Next.js Framework & UI Technology Skill

## 1. Purpose & Activation

Provides technology-specific guidance for Next.js routing, rendering, Server/Client boundaries, data fetching, caching, Server Actions, asset optimization, and configuration during development and code review.

**Activate ONLY when** code changes involve Next.js routing (`app/` or `pages/`), `"use client"` / `"use server"` directives, `next/navigation`, `next/router`, Next.js `fetch()` caching, Route Handlers, `next/image`, `next/font`, or `next.config.js`.

**Do NOT activate for** general React hook/lifecycle rules (managed by React skill), general component architecture (`skill-ui-component-patterns`), browser performance (`skill-ui-performance-optimization`), HTML accessibility (`skill-ui-html-accessibility`), or CSS standards (`skill-ui-css-standards`).

## 2. Core Rules Summary

| ID | Rule | Scope & Objective |
|---|---|---|
| NEXT01 | Router Architecture & File Routing | Respect file-based routing conventions, route groups, and dynamic parameters for the active router (`app/` vs `pages/`). |
| NEXT02 | Server & Client Component Boundaries | Isolate `"use client"` directives to interactive subtrees; verify prop serialization across Server-to-Client boundaries for unsupported values. |
| NEXT03 | Rendering Strategies & Hydration | Apply static, dynamic, SSR, ISR, or streaming strategies based on route needs and framework capabilities without prescribing Server Components universally. |
| NEXT04 | Version-Aware Fetch & Cache Mechanics | Inspect installed Next.js version and router config before evaluating Data Cache, request memoization, or `"use cache"` directives. |
| NEXT05 | Server Actions & Route Handler Security | Treat `"use server"` actions and Route Handlers as server entry points requiring access controls and input validation appropriate to operation risk. |
| NEXT06 | Framework Navigation & Metadata API | Use `next/link`, router hooks (`next/navigation` vs `next/router`), and Metadata API / layout boundaries appropriately. |
| NEXT07 | Asset Optimization & Resource Loading | Recommend `next/image`, `next/font`, or `next/script` where beneficial without mandating them over valid native alternatives. |
| NEXT08 | Framework Config, Runtime & Middleware | Configure `next.config.js`, handle Edge vs Node.js runtime boundaries, and respect version-specific Middleware / Proxy (`proxy.ts`) conventions. |

## 3. Development Guidance

- **Router Conventions**: Use `app/` conventions (App Router) or `pages/` conventions (Pages Router) matching project architecture. Do not mix router hooks (`next/navigation` vs `next/router`).
- **Server/Client Boundaries**: Recognize Client Components are server-prerendered into HTML. Ensure values crossing Server-to-Client boundaries follow version-supported serialization rules (allowing Server Functions `"use server"`, Promises, and JSON-serializable values).
- **Data Fetching & Caching**: Check `package.json` for installed Next.js version before evaluating caching policies (`fetch()` options, `revalidatePath`, `revalidateTag`, `"use cache"`). Consider feature freshness needs and route config without assuming missing cache config is a defect.
- **Server Actions & Route Handlers**: Apply authentication, authorization, and input validation to Server Actions and Route Handlers based on access requirements and risk. Do not require session auth for intentionally public endpoints (login, registration, webhooks).
- **Assets & Environment**: Use `next/image`, `next/font`, or `next/script` when advantageous while accepting valid native `<img>` or SVG alternatives. Use `NEXT_PUBLIC_` only for intentionally exposed client environment variables.

## 4. Review Checks & Evidence Requirements

- **Evidence Requirement**: Cite: (1) exact file path and line number, (2) installed Next.js and React versions, (3) active router context (`app/` or `pages/`), (4) applicable NEXT rule, (5) relevant framework behavior and configuration, and (6) concrete defect or violated requirement.
- **RSC Boundary Serialization**: Flag unsupported non-serializable values (e.g. class instances, DOM elements, unhandled raw client functions) passed across Server-to-Client RSC boundaries.
- **Unprotected Restricted Mutation**: Flag restricted state or database mutations in Server Actions or Route Handlers executing without necessary access control or input validation.
- **Navigation Hook Mismatch**: Flag importing `useRouter` from `next/router` inside App Router (`app/`) components or `next/navigation` inside Pages Router (`pages/`).

## 5. Common Anti-Patterns

- **Unhandled RSC Non-Serializable Props**: Passing class instances, DOM elements, or unhandled raw client functions across Server-to-Client RSC boundaries.
- **Unprotected Restricted Mutations**: Performing restricted database or state mutations in Server Actions or Route Handlers without verifying authorization or input safety.
- **Router Hook Context Mismatch**: Importing `useRouter` from `next/router` in App Router components, causing runtime null router context errors.
- **Edge Runtime Incompatibility**: Referencing Node.js-only modules (e.g. `fs`, `child_process`) inside Edge runtime routes or Middleware.

## 6. False-Positive Safeguards

Do NOT flag:
- Pages Router files (`pages/`) for using `getServerSideProps`, `getStaticProps`, or `next/router`.
- Server Functions (`"use server"`), Promises passed to `use()`, or valid RSC-serializable props crossing Server-to-Client boundaries.
- Client Components (`"use client"`) as performance defects or assume they bypass server prerendering into initial HTML.
- Missing cache options or uncached `fetch()` without verifying installed Next.js version defaults, route config, and freshness requirements.
- Intentionally public Server Actions or Route Handlers (e.g. login, public registration, contact forms, webhooks) for lacking session auth.
- Native HTML `<img>`, inline SVG, or standard `<script>` tags when native loading strategies are appropriate.
- Server-side environment variable references (without `NEXT_PUBLIC_`) as client leaks unless bundled into client artifacts.
- Version-specific Proxy (`proxy.ts` in Next 16) or Middleware (`middleware.ts`) conventions matching target version docs.

## 7. Development & Review Checklist

- [ ] Confirmed router context (`app/` vs `pages/`) and imported matching navigation hooks (`next/navigation` vs `next/router`)?
- [ ] Verified Server-to-Client prop values conform to React/Next.js RSC serialization support?
- [ ] Evaluated `fetch()` caching and revalidation settings against installed Next.js version documentation?
- [ ] Applied appropriate access controls, authorization, and input validation to Server Actions and Route Handlers?
- [ ] Ensured server secrets remain unbundled from client artifacts and verified `NEXT_PUBLIC_` environment exposure?

