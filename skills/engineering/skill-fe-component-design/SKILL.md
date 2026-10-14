---
name: skill-fe-component-design
description: >-
  Activate when reviewing frontend code changes involving component boundaries, props/input contracts, presentation
  vs business logic separation, component cohesion, prop drilling vs composition, design system primitives, or UI testability
  across React, Angular, Vue, Svelte, Blazor, TypeScript, and JavaScript.
---

# Frontend Component Design Engineering Review Skill

## 1. Purpose & Activation

This skill evaluates pull requests and code modifications for frontend component architecture defects, including god components mixing multiple unrelated domains, tight coupling between parent and child internals, convoluted prop/input contracts with conflicting boolean modes, premature abstractions leaking special cases, tangled presentation and domain calculations, unmaintainable deep prop drilling, and designs that obstruct isolated component unit testing across React, Angular, Vue, Svelte, Blazor, TypeScript, and JavaScript applications.

**Activate when** code changes introduce or modify component templates/JSX, component public interfaces (props, inputs, outputs, slots, render props), container/presentational component structures, custom UI primitives, design system components, or inter-component composition hierarchies; or when review context cites bloated components, difficult-to-test UI logic, breaking changes across UI consumers, or rigid component abstractions.

Do not report findings solely because a component has many lines or multiple event handlers if they serve a single cohesive domain feature, or enforce arbitrary line-count or file-splitting rules where colocation is idiomatic and clean.

## 2. Technology Context

Infer the frontend framework and component paradigm from imports, file extensions, and component structures (e.g. React functional components/hooks, Vue Single-File Components with `<script setup>`, Angular `@Component` standalone classes, Svelte `.svelte` components, Blazor `.razor` components). Apply universal component design principles (cohesion, coupling, interface clarity, composition over inheritance) without bias toward specific styling or state libraries.

Refer to [`references/checklist.md`](references/checklist.md) for paradigm-specific detection patterns and examples.

Technology context guides how rules are applied; it is not a standalone review objective. Report only evidence-based design defects demonstrating concrete maintainability, testability, or regression risks.

## 3. Frontend Component Design Rules

| ID | Rule | Objective |
|---|---|---|
| FCD01 | Single Responsibility & Cohesion | Eliminate god components mixing presentation, complex business logic, API orchestration, and routing. |
| FCD02 | Separation of Concerns & Layering | Prevent domain calculations, network queries, and storage logic from being embedded in UI rendering trees. |
| FCD03 | Component Coupling & Encapsulation | Prevent parent components from directly mutating child internals or depending on child private state. |
| FCD04 | Props, Inputs & Interface Contracts | Eliminate confusing boolean mode flags, excessive unrelated props, and ambiguous callback signatures. |
| FCD05 | Composition & Hierarchy Depth | Replace brittle deep prop-drilling and redundant wrapper layers with clear slot/children composition. |
| FCD06 | Abstraction Leaks & Special-Casing | Prevent reusable UI primitives from accumulating feature-specific conditional hacks and domain branches. |
| FCD07 | Duplicated Logic & Synchronization | Consolidate identical business validation rules or UI workflows duplicated across multiple sibling components. |
| FCD08 | Side-Effect Separation & Lifecycle | Prevent components from interleaving unrelated side effects (timers, subscriptions, metrics) with rendering. |
| FCD09 | Component Testability & Isolation | Decouple untestable hidden dependencies and complex render-bound logic to enable isolated unit testing. |
| FCD10 | Domain Ownership & Consistency | Ensure domain entities and state mutations have a clear owning component or dedicated domain service hook. |

*Detailed criteria, evidence, and remediation per rule are defined in [`references/checklist.md`](references/checklist.md).*

## 4. Review Workflow

1. **Inspect Component Interfaces**: Examine component props, inputs, events, and slots for cohesion and contradictory mode flags.
2. **Trace Responsibilities & Dependencies**: Identify all concerns handled by the component (rendering, validation, data fetching, navigation).
3. **Evaluate Coupling & Composition**: Check for parent-child internal access, multi-layer prop drilling, and abstraction leakage.
4. **Assess Testability & Isolation**: Verify whether core business rules can be verified without mounting entire application subsystems.
5. **Score & Deduplicate**: Apply [`references/scoring-guide.md`](references/scoring-guide.md). Consolidate multiple symptoms sharing a single design root cause.
6. **Generate Output**: Format findings using the Scorecard Aggregator schema below.

## 5. Review Principles & False-Positive Safeguards

- **Demonstrated Maintenance Risk**: Report design defects supported by concrete code evidence; show how current structure increases regression risk or blocks testing.
- **No Arbitrary Size Thresholds**: Do not flag components solely based on line counts or method counts without demonstrating mixed responsibilities.
- **Valid Cohesive Workflows**: Do not force splitting of tightly coupled UI sections (e.g. form inputs and their inline field validations) when split adds indirection without reuse.
- **No Style/Framework Dogmatism**: Do not demand migration to specific component paradigms (e.g. atomic design, render props, higher-order components) if existing structure is clear.
- **Duplication vs Premature Abstraction**: Allow minor coincidental markup duplication over brittle, highly coupled abstractions full of boolean mode flags.
- **Root-Cause Deduplication**: Multiple readability or coupling issues stemming from a single god component should be consolidated under `FCD01`.

## 6. Skill Boundaries & Coordination

- **Frontend State Management** ([`skill-fe-state-management`](../skill-fe-state-management/SKILL.md)): Store reactivity, async race conditions, and derived calculations.
- **Frontend API Integration** ([`skill-fe-api-integration`](../skill-fe-api-integration/SKILL.md)): HTTP request serialization, endpoint contracts, and network error handling.
- **Frontend Security** ([`skill-fe-frontend-security`](../skill-fe-frontend-security/SKILL.md)): XSS vulnerabilities, sensitive credential leakage, and client-side auth bypasses.
- **Engineering Modularity** ([`skill-eng-modularity`](../skill-eng-modularity/SKILL.md)): Cross-service module boundaries, package architecture, and circular dependency graphs.
- **Engineering Test Quality** ([`skill-eng-test-quality`](../skill-eng-test-quality/SKILL.md)): Test assertion quality, mock fidelity, and test suite execution.
- **Resource Lifecycle** ([`skill-eng-resource-lifecycle`](../skill-eng-resource-lifecycle/SKILL.md)): Web workers, socket lifecycle, and native event listener leaks.

## 7. Output Contract & References

Return structured output compatible with the Code Review Portal Scorecard Aggregator:

```json
{
  "dimension": "frontend_component_design",
  "score": 6.0,
  "findings": [
    {
      "ruleId": "FCD01",
      "title": "God component mixes billing calculation, payment API orchestration, and modal presentation",
      "severity": "high",
      "confidence": "high",
      "file": "src/components/CheckoutModal.tsx",
      "lineStart": 22,
      "lineEnd": 145,
      "evidence": "CheckoutModal directly executes tax calculations, Stripe API calls, receipt PDF generation, and multi-step form rendering.",
      "impact": "Changes to receipt generation risk breaking payment processing; component cannot be unit tested without extensive API mocks.",
      "recommendation": "Extract tax calculations to a domain helper and payment orchestration to a dedicated custom hook or service.",
      "technology": "React/TypeScript",
      "status": "open"
    }
  ],
  "uncertainty_notes": [],
  "blocked": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `ruleId` | string | Yes | FCD01–FCD10 stable identifier |
| `title` | string | Yes | Concise issue summary |
| `severity` | string | Yes | `critical`, `high`, `medium`, or `low` |
| `confidence` | string | Yes | `high`, `medium`, or `low` |
| `file` | string | Yes | Repository-relative path |
| `lineStart` | integer | Yes | First line number of the relevant code |
| `lineEnd` | integer | No | End line number of the relevant code block |
| `evidence` | string | Yes | Concrete code observation supporting the issue |
| `impact` | string | Yes | High maintenance cost, regression risk, coupling, or untestability |
| `recommendation` | string | Yes | Actionable remediation preserving valid behavior |
| `technology` | string | No | Inferred technology stack |
| `status` | string | No | Finding lifecycle status (default: `open`) |

Integration rules for the aggregator:
- `score` is calculated directly on a native 0.0–10.0 scale from start to finish without any intermediate 0–100 calculation or division, according to [`references/scoring-guide.md`](references/scoring-guide.md).
- `blocked` is set to `true` when the dimension score is below 9.0 (9/10) or when any confirmed critical violation is present.
- A score of 10.0 (10/10) indicates pass with zero violations; 9.0 (9/10) indicates pass with at most one minor non-blocking finding and no critical violations.
- Low-confidence observations must be recorded in `uncertainty_notes` and incur 0 deductions.

## 8. Supporting References

- **Inspection Checklist**: [`references/checklist.md`](references/checklist.md) — Detailed criteria, evidence, and remediation per rule.
- **Scoring Guide**: [`references/scoring-guide.md`](references/scoring-guide.md) — Severity tiers, deduction formulas, exceptions, and merge blocking.
- **Validation Suite**: [`validation/test-suite.json`](validation/test-suite.json) — Automated test cases for detection and false-positive verification.

