# Frontend Routing and Navigation Review - Scoring Guide

## 1. Native 0.0 - 10.0 Scoring Scale

Every code review evaluation under `skill-fe-routing-and-navigation` calculates a raw numerical score on a `0.0` to `10.0` scale. The evaluation starts at `10.0` (defect-free baseline) and applies structured deductions based on identified rule violations.

| Score Range | Review Determination | Severity Description | Action Required |
| :--- | :--- | :--- | :--- |
| **9.0 - 10.0** | **APPROVED / PASS** | Clean routing architecture; minor or zero informational notes. | Merge permitted. |
| **7.0 - 8.9** | **NEEDS WORK / WARN** | Non-blocking defects, query param leaks, or missing fallback UX. | Remediation recommended before release. |
| **0.0 - 6.9** | **BLOCKED / FAIL** | Critical auth guard bypass, broken navigation, infinite redirect loops, or race conditions. | **Merge blocked**. Must fix before merging. |

---

## 2. Base Deduction Rules by Severity

Deductions are calculated per distinct defect instance across the 10 routing rules:

| Severity Level | Standard Base Deduction | Exemplar Rule Violations |
| :--- | :--- | :--- |
| **CRITICAL** | **-3.0 to -4.0** | `FRN07` (Auth Guard bypass/flash, infinite redirect loops), `FRN01` (Unreachable critical routes) |
| **HIGH** | **-1.5 to -2.5** | `FRN02` (Unencoded dynamic params breaking navigation), `FRN03` (Stale component state across param change), `FRN06` (Broken direct URL access / deep link crash), `FRN08` (Missing `<Outlet />` breaking child rendering), `FRN09` (Route fetch race conditions overwriting state) |
| **MEDIUM** | **-0.8 to -1.2** | `FRN04` (Query params wiped during navigation), `FRN05` (History stack spam on keystroke), `FRN10` (Missing 404 fallback or error boundary) |
| **LOW** | **-0.2 to -0.5** | Minor route naming inconsistencies, non-semantic link elements where functionality is preserved, redundant redirect hops. |

---

## 3. Contextual Deduction Multipliers

Adjust the base deduction when specific risk factors are present:

- **Public Facing / High Traffic Route Multiplier (`x 1.25`)**: Defects affecting primary entry points (e.g., `/login`, `/dashboard`, `/checkout`, `/catalog`).
- **Security-Impacting Boundary Multiplier (`x 1.50`)**: Defects exposing protected route views or leaking sensitive tokens in URLs.
- **Repeat Pattern Multiplier (`x 1.20`)**: The same routing anti-pattern repeated across multiple independent route files.

---

## 4. Automatic Merge-Blocking Thresholds

A review is automatically rated **FAIL / BLOCKED** (Score `< 7.0`) regardless of other components if any of the following conditions occur:

1. **Unprotected Route Guard Bypass (`FRN07`)**: Protected route content flashes or renders before authentication state is validated.
2. **Infinite Redirect Loop (`FRN07`)**: Redirect rules form a closed cycle (e.g., `/login` redirecting to `/` which redirects to `/login`).
3. **Broken Deep Links for Primary Views (`FRN06`)**: Direct URL access or page reload results in an unhandled crash because component relies entirely on in-memory `location.state`.
4. **Missing Outlet in Parent Layout (`FRN08`)**: Parent layout omits `<Outlet />` causing all child routes to be completely invisible.
5. **Score Falls Below 9.0 on High-Assurance Enforced Repositories**: Any PR scoring `< 9.0` must resolve flagged HIGH/CRITICAL issues prior to approval.

