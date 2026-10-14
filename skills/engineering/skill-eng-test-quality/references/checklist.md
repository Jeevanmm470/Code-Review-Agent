# Test Quality Inspection Checklist & Rules Reference

Detailed rule definitions, detection patterns, evidence requirements, and remediation directions for `skill-eng-test-quality`.

---

## TST01: Meaningful Assertions & Non-Trivial Checks

- **Purpose:** Ensure test cases contain substantive assertions verifying domain outcomes and side effects rather than empty smoke execution, tautologies, or overly permissive checks.
- **Detect:**
  - Test functions executing logic with zero `assert`, `expect()`, `assertEquals`, or verify statements.
  - Tautological assertions (e.g., `assert response is not None` when checking specific response body content, `assertTrue(true)`).
  - Swallowed exceptions inside tests that cause failing code to pass silently.
- **Evidence:** Test method invoking target code with no assertions or assertions testing trivial non-nullness.
- **Avoid:** Framework tests where assertion is implicitly handled by contract verifiers or custom assertion helpers.
- **Remediation:** Add precise assertions checking state changes, returned payloads, and expected business outcomes.
- **Severity:** HIGH.

---

## TST02: Behavioral & Bug Regression Coverage

- **Purpose:** Verify bug fixes and new business capabilities include targeted regression tests preventing accidental reintroduction of reported defects.
- **Detect:**
  - Bug fix PR modifying conditional edge cases or algorithm logic without an accompanying test exercising the reported defect scenario.
  - New feature added without testing its core business workflows.
- **Evidence:** Bug fix modifying logic without adding or modifying test cases covering the trigger condition.
- **Avoid:** Pure documentation fixes, typo corrections, or minor stylistic refactorings.
- **Remediation:** Add a regression test reproducing the exact failure scenario that was fixed.
- **Severity:** HIGH.

---

## TST03: Failure Path & Boundary Verification

- **Purpose:** Assert that invalid inputs, exceptions, network timeouts, and partial failures produce expected error responses and clean system state.
- **Detect:**
  - Only testing happy-path execution while completely ignoring validation failures, boundary extremes (0, negative, empty string), and exceptions.
  - Tests catching an expected exception (`assertRaises`, `assertThrows`) but failing to assert the error message, status code, or state rollback.
- **Evidence:** Service with extensive error handling branches that have zero corresponding failure test cases.
- **Avoid:** Trivial helper functions with no error branches or unreachable edge cases.
- **Remediation:** Add test cases for boundary values, invalid inputs, and expected exception types with detailed error assertions.
- **Severity:** MEDIUM (HIGH if critical financial or security error paths are omitted).

---

## TST04: Test Isolation & State Cleanup

- **Purpose:** Prevent tests from depending on execution order, shared mutable singletons, or leaking persisted disk/database state across runs.
- **Detect:**
  - Modifying global variables, static singletons, or system properties without resetting them in `tearDown` / `finally`.
  - Creating real files in shared directories without deleting them after the test completes.
  - Tests passing when run individually but failing when run as part of the full suite due to polluted shared state.
- **Evidence:** Static field mutation or file/database creation without cleanup in test teardown hooks.
- **Avoid:** In-memory tests using isolated local test fixtures or transaction rollbacks.
- **Remediation:** Use isolated test databases, temporary directories, or register teardown hooks to reset global state.
- **Severity:** HIGH.

---

## TST05: Mock Fidelity & Over-Mocking Prevention

- **Purpose:** Prevent tautological mocks that mirror internal implementation details without testing business logic or real contracts.
- **Detect:**
  - Mocking the system under test (SUT) or mocking every internal collaborator so that the test only asserts its own mock configuration.
  - Mocks configured with unrealistic behavior (e.g., returning data structures that violate real API schemas).
  - Tests breaking on minor refactorings because assertions verify private internal call order rather than public outcomes.
- **Evidence:** Test file with 90% mock setup verifying internal method call counts with no domain assertions.
- **Avoid:** Mocking expensive third-party payment gateways, external email servers, or hardware drivers.
- **Remediation:** Use real in-memory implementations, domain objects, or fakes; test observable state rather than mock call counts.
- **Severity:** MEDIUM.

---

## TST06: Deterministic Execution & Flakiness Elimination

- **Purpose:** Eliminate non-deterministic sleeps, uncontrolled clock dependencies, thread race conditions, and random seeds that cause flaky test runs.
- **Detect:**
  - Using hardcoded `Thread.sleep()` / `time.sleep()` to wait for asynchronous events instead of polling with awaitility/wait conditions.
  - Using `new Date()` / `datetime.now()` in tests with strict equality checks that fail around second boundaries.
  - Tests relying on unseeded random numbers or uncontrolled thread scheduling.
- **Evidence:** `sleep(1000)` preceding an assertion on async results or direct current time comparison.
- **Avoid:** Load/stress tests or property-based test suites configured with deterministic seed reporting.
- **Remediation:** Replace fixed sleeps with condition-based polling (`await waitFor(...)`) and inject mockable clock time providers.
- **Severity:** MEDIUM (HIGH if causing frequent CI pipeline test failures).

---

## TST07: Integration & Contract Boundary Verification

- **Purpose:** Verify that external boundaries (databases, HTTP APIs, serializers, provider adapters) have contract or integration tests.
- **Detect:**
  - Complex SQL queries or ORM entity relationships tested solely with mocked repository interfaces without real DB validation.
  - Custom serializers/deserializers without tests verifying JSON round-trip compatibility.
- **Evidence:** Critical integration adapters (database, message queues) possessing only unit tests with mocked transport.
- **Avoid:** Simple CRUD repositories with standard framework mapping already covered by integration test baselines.
- **Remediation:** Add contract test suites or Testcontainers-based integration tests verifying boundary interactions.
- **Severity:** MEDIUM.

---

## TST08: Test Fixture Clarity & Environment Hygiene

- **Purpose:** Ensure test fixtures and seed data are clean, isolated, self-describing, and free of hardcoded environment paths or secrets.
- **Detect:**
  - Hardcoded local file paths (`/Users/developer/...`, `C:\workspace\...`) or live production credentials in test files.
  - Massive opaque fixture objects (1000+ lines of JSON) where the specific fields relevant to the test are hidden.
- **Evidence:** Machine-specific paths, credentials, or monolithic obscure test fixtures.
- **Avoid:** Realistic anonymized golden master test datasets with clear documentation.
- **Remediation:** Parameterize paths, use relative fixture paths, generate concise test data with factory builders.
- **Severity:** LOW.

---

## TST09: Async & Concurrency Test Synchronization

- **Purpose:** Ensure asynchronous operations, background promises, and concurrent threads are properly awaited and joined.
- **Detect:**
  - Launching async tasks / promises inside tests without `await` / `.join()`, causing assertions to execute before tasks complete.
  - Unhandled promise rejections occurring in background threads after test teardown.
- **Evidence:** Async function called without `await` or `.get()` inside test body.
- **Avoid:** Tests designed specifically to test fire-and-forget logging where background task execution is not asserted.
- **Remediation:** Correctly `await` async functions or use structured concurrency constructs to ensure all tasks complete before assertions.
- **Severity:** HIGH.

---

## TST10: Risk-Proportionate Test Scoping

- **Purpose:** Ensure critical business logic, financial calculations, security checks, and high-impact workflows have thorough multi-case test coverage matching operational risk.
- **Detect:**
  - High-risk pricing, tax, or authorization algorithms tested with only a single trivial happy-path case.
  - Complex state machines with dozens of transitions tested with only one transition.
- **Evidence:** Multi-branch critical business algorithm with single trivial test case.
- **Avoid:** Simple pass-through getters/setters or standard configuration wiring.
- **Remediation:** Add parameterized / table-driven test cases exercising all critical calculation branches and edge conditions.
- **Severity:** HIGH.

