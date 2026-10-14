---
name: skill-ui-forms-and-validation
description: >-
  Activate ONLY when authoring or reviewing UI form inputs, field validation, form state management, submission handling,
  conditional form fields, error recovery, or form payload transformation contracts.
  Do NOT activate for standalone CSS styling, design tokens, HTML accessibility semantics, general API logic, or backend code.
---

# UI Forms & Validation Engineering Skill

## 1. Purpose & Activation

Provides framework-independent engineering standards for UI form development, validation, submission lifecycle management, error recovery, and form state consistency.

**Activate ONLY when** code changes involve form input controls, field validation rules, form state tracking, submission handling, conditional fields, error recovery, or form payload mapping.

**Do NOT activate for** design tokens (`skill-ui-style-guide-core`), HTML accessibility (`skill-ui-html-accessibility`), CSS styling (`skill-ui-css-standards`), component composition (`skill-ui-component-patterns`), business logic (`skill-eng-business-logic`), or backend security (`skill-eng-security`).

## 2. Core Rules Summary

| ID | Rule | Scope & Objective |
|---|---|---|
| FORM01 | Input Preservation & State Recovery | Preserve user inputs during recoverable errors; handle sensitive fields according to security policy and workflow requirements. |
| FORM02 | Contextual Validation Timing | Apply validation on input, blur, or submit based on field UX requirements without disruptive error loops. |
| FORM03 | Client Validation & Server Complement | Implement client-side validation that matches spec and complements (never replaces) server-side validation. |
| FORM04 | Duplicate Submission Protection | Prevent unintended duplicate operations via submission guards, request coordination, or server idempotency. |
| FORM05 | Backend Error Mapping & Recovery | Map field-specific server errors to UI controls when supported by API contracts to aid user recovery. |
| FORM06 | Form State & Dependent Field Sync | Synchronize values, errors, touched/dirty flags, and conditional fields without stale state or memory leaks. |
| FORM07 | Contextual Payload Transformation | Apply type conversions, formatting, and trimming only when required by field semantics and API contracts; preserve whitespace-sensitive inputs. |
| FORM08 | Dynamic & Multi-Step Form Continuity | Maintain field state integrity and partial progress across multi-step flows and dynamic field collections. |

## 3. Development Guidance

- **Input Preservation**: Retain user-entered field values during recoverable validation or network errors; preserve or clear sensitive inputs (passwords, PINs) per security policies and documented workflow requirements.
- **Validation Timing**: Support input-, blur-, or submit-time validation based on UX specifications; flag real-time validation only when it causes demonstrable usability issues.
- **Submission Guarding**: Coordinate submission states via UI pending guards, disabled handlers, HTTP client interceptors, or server-side idempotency keys.
- **Error Mapping**: Map field-specific backend errors to corresponding UI fields when supported by API response contracts; accept centralized notifications when field mapping is unavailable.
- **Payload Transformation**: Convert types, parse numbers, format dates, and trim text strictly when required by field semantics and target API contracts. Preserve whitespace-sensitive inputs (e.g. passwords, secrets).

## 4. Review Checks & Evidence Requirements

- **Evidence Requirement**: Verify: (1) exact file path and line number, (2) applicable FORM rule and relevant code, (3) feature specification or API contract, (4) concrete failure scenario or state transition defect, and (5) whether shared form utilities, parent components, form libraries, or infrastructure already handle the behavior. Do not report speculative findings.
- **Unintended Data Loss**: Verify whether field resets upon error violate documented workflows or user expectations.
- **Unguarded Duplicate Submit**: Confirm absence of UI guards, parent pending state, shared interceptors, and server idempotency keys before flagging double submit risks.
- **Unmapped Field Errors**: Ensure field-level error mapping is explicitly supported by backend response schemas before reporting generic error fallbacks.

## 5. Common Anti-Patterns

- **Recoverable Input Eradication**: Clearing user input upon recoverable backend validation or network failures without workflow justification.
- **Disruptive Inline Errors**: Triggering aggressive inline validation messages that interfere with user completion without requirement support.
- **Over-Trimming Sensitive Inputs**: Automatically stripping leading/trailing whitespace from password fields or secrets, altering intended user data.
- **Stale Async Validation**: Applying response errors from outdated asynchronous validation requests.

## 6. False-Positive Safeguards

Do NOT flag:
- Sensitive input handling or form resets executed according to documented security policies or workflow specifications.
- Real-time or submit-time validation implemented according to project UX specifications.
- Missing in-component submission flags when duplicate protection is handled by parent state, HTTP interceptors, or server idempotency.
- Generic error alerts/toasts when backend responses lack field-specific error details or centralized handling is intended.
- Preserving whitespace on sensitive fields (passwords, API keys) or un-trimmed text areas where formatting is intentional.
- Form libraries or shared utilities managing validation, state, or submission internally.

## 7. Development & Review Checklist

- [ ] Preserved user input during recoverable errors and initialized defaults cleanly per workflow requirements?
- [ ] Configured contextual validation timing without disruptive error feedback loops?
- [ ] Guarded against duplicate form submissions via component, shared helper, or server-side idempotency?
- [ ] Mapped field-specific server errors to UI controls when supported by API contracts?
- [ ] Applied payload transformations (types, dates, nulls, trimming) per field semantics and API contracts without altering whitespace-sensitive inputs?
