# Loop and Iteration Safety Inspection Checklist

This checklist defines review criteria, detection heuristics, evidence patterns, anti-patterns, remediation strategies, and default severities for rules `LPS01` through `LPS10`.

---

## LPS01: Guaranteed Loop Termination & Progress Invariants

- **Purpose:** Ensure every loop construct has a guaranteed termination condition and that every code path inside the loop body monotonically advances toward termination.
- **Detect:**
  - `while` loops where the condition variable is not updated within all branches (e.g., conditional branches skipping index increment or state mutation).
  - Infinite loops (`while True:`, `for (;;)`) that lack an unconditional internal `break`, `return`, or exception throw.
  - Loops relying on external state changes without timeouts, cancellation checks, or break conditions.
  - Variable overflows or cyclic arithmetic preventing termination criteria from ever being satisfied.
- **Evidence:**
  - Code contains a `while condition:` block where one or more execution branches (such as `if ... continue`) bypass the increment or state modification statements.
  - Loop condition never becomes false because the updating expression modifies an unrelated variable or resets the loop variable.
- **Avoid:**
  - Flagging intentional infinite server run-loops or actor message loops that cleanly monitor a shutdown flag or cancellation token (`while not shutdown_event.is_set():`).
- **Remediation:**
  - Ensure loop control variables advance unconditionally across all branch paths (or use structured `for...in` / `for...of` loops).
  - Add hard maximum iteration counters (`for _ in range(MAX_ITERATIONS):`) to safeguard against divergence.
- **Severity:** Critical

---

## LPS02: Off-by-One & Boundary Condition Safety

- **Purpose:** Prevent index out-of-bounds exceptions, omitted boundary elements, and incorrect fencepost calculations when traversing ordered collections.
- **Detect:**
  - Using `<= len(array)` instead of `< len(array)` in 0-indexed array iterations.
  - Starting 0-indexed array iteration at index 1 and inadvertently skipping the initial item, or ending at `len - 1` with `<` and skipping the final item.
  - Substring/slice boundary calculations that trim off required characters or raise out-of-range slice errors.
  - Binary search or sliding window boundary updates that fail to move pointers (`low = mid` instead of `low = mid + 1` causing infinite loops on two-element arrays).
- **Evidence:**
  - Direct indexing `items[i]` inside `for (int i = 0; i <= items.length; i++)` or `items[index]` when `index == len(items)` is reachable.
  - Pointer convergence where `left == right` causes infinite loop or array index crash.
- **Avoid:**
  - Flagging 1-indexed database or UI pagination offsets where 1-based bounds are explicitly intended and mapped.
- **Remediation:**
  - Use high-level iterators (`for item in items`, `for (const item of items)`) instead of manual index counters where indexing is not strictly needed.
  - For manual index bounds, use standard half-open intervals `[0, len)` and verify inclusive vs exclusive boundaries in window algorithms.
- **Severity:** High

---

## LPS03: Safe Iteration Over Mutated Collections

- **Purpose:** Prevent runtime exceptions (`ConcurrentModificationException`, `RuntimeError: dictionary changed size during iteration`), skipped items, or infinite expansions caused by modifying collections while iterating over them.
- **Detect:**
  - Adding or removing items from a list, map, set, or dictionary while directly iterating over its keys or elements.
  - Modifying a list in a forward index loop (`for i in range(len(items)): del items[i]`) causing subsequent elements to shift and be skipped.
  - Appending elements to a list while iterating over it, causing the loop length to expand indefinitely.
- **Evidence:**
  - Direct deletion `del data[key]` inside `for key in data:` or `items.remove(item)` inside `for (Item item : items)`.
  - In-place mutation shifting indices in forward manual index loops.
- **Avoid:**
  - Flagging iterations over defensive copies or snapshots (e.g., `for key in list(data.keys()):`, `new ArrayList<>(list)`).
  - Flagging explicit iterator-based deletions (`iterator.remove()`) in languages where iterators support safe removal.
- **Remediation:**
  - Create a defensive copy of the collection or keys before starting iteration, or collect keys/items to remove into a separate deletion list.
  - Use functional filters (`items = [x for x in items if keep(x)]`, `items.removeIf(...)`) rather than mutating in a loop.
- **Severity:** High

---

## LPS04: Pagination & Cursor Traversal Progression

- **Purpose:** Guarantee cursor and token advancement, cycle detection, and empty-page termination in paginated queries and stream traversals.
- **Detect:**
  - Pagination loops that do not check for an empty result page and continue requesting pages because `next_token` is present or non-null.
  - Loops where `next_token == current_token` is returned by an API and results in an infinite retrieval cycle.
  - Missing total page / maximum item safeguards on external API pagination.
- **Evidence:**
  - `while next_page_token:` loop without verifying that `len(response.items) > 0` or without checking if `next_page_token == previous_page_token`.
  - Pagination loop lacking a maximum page guard (`MAX_PAGES`) against malfunctioning external endpoints.
- **Avoid:**
  - Flagging paginated iterators that properly validate token updates, batch non-emptiness, and include maximum page guards.
- **Remediation:**
  - Verify that each page yields non-empty records and that `next_token != current_token`.
  - Add a hard ceiling on total pages fetched (`page_count < MAX_PAGES`) to prevent infinite network request loops.
- **Severity:** High

---

## LPS05: Recursive Convergence & Base Case Verification

- **Purpose:** Ensure recursive functions strictly converge toward explicit base cases with recursion depth guards to prevent call stack exhaustion and stack overflow crashes.
- **Detect:**
  - Recursive functions missing an explicit terminating base case for valid, empty, or negative inputs.
  - Recursive step that does not reduce the problem size (e.g., `recurse(n)` instead of `recurse(n - 1)` or cyclic graph traversal without a visited set).
  - Unbounded tree or graph recursion on potentially cyclic structures without cycle detection.
- **Evidence:**
  - Recursive call parameters remain identical or increase across calls.
  - Deep tree traversal lacking cycle tracking (`visited = set()`) or recursion depth limits.
- **Avoid:**
  - Flagging well-bounded recursive traversals over strictly acyclic DAG structures or tail-recursive functions with verified base cases.
- **Remediation:**
  - Validate that base cases are evaluated at the top of the function and cover all edge inputs (null, empty, negative).
  - Track visited node identifiers in graph traversals and enforce a maximum depth parameter (`depth < MAX_DEPTH`).
- **Severity:** Critical

---

## LPS06: Bounded Retries & Polling Deadlines

- **Purpose:** Ensure retry and polling loops enforce maximum attempt counts, exponential backoff with jitter, and overall timeout deadlines.
- **Detect:**
  - `while True:` or `while not condition:` polling loops lacking a timeout deadline or maximum attempt counter.
  - Tight spin loops polling an external resource without sleep/delay intervals (consuming 100% CPU).
  - Retry logic that catches all exceptions and retries indefinitely without backoff.
- **Evidence:**
  - `while not status == "COMPLETED": time.sleep(1)` lacking an overall deadline (`time.time() > deadline`) or max attempt counter.
  - Infinite retry loop on non-retryable 4xx HTTP responses or unrecoverable domain errors.
- **Avoid:**
  - Flagging polling mechanisms that utilize standard resilience libraries (e.g., Polly, Tenacity, Resilience4j) with configured retry caps and timeouts.
- **Remediation:**
  - Bound all polling loops by both maximum attempts and an absolute deadline timestamp (`deadline = time.monotonic() + TIMEOUT_SEC`).
  - Introduce exponential backoff and verify retryable exception criteria.
- **Severity:** High

---

## LPS07: Async Loop Cancellation & Shutdown Propagation

- **Purpose:** Ensure asynchronous and background worker loops respond promptly to cancellation tokens, shutdown signals, and task cancellations.
- **Detect:**
  - `async` worker loops that catch and swallow `asyncio.CancelledError` or `OperationCanceledException` without breaking out of the loop.
  - Background task loops that run `while True:` without checking `cancellationToken.IsCancellationRequested` or `ctx.Done()`.
  - Unbounded async generator processing that ignores downstream consumer disconnects.
- **Evidence:**
  - Swallowed cancellation exception `except asyncio.CancelledError: pass` inside an infinite loop, keeping the worker alive.
  - Worker loop running indefinitely after shutdown has been signaled by the application host.
- **Avoid:**
  - Flagging tasks that perform necessary cleanup inside `finally` blocks before re-raising the cancellation exception.
- **Remediation:**
  - Check cancellation status at the start of each iteration (`if cancel_token.is_set(): break`).
  - Allow cancellation exceptions to propagate cleanly or break loop execution after performing resource cleanup.
- **Severity:** High

---

## LPS08: In-Loop Resource & Buffer Containment

- **Purpose:** Prevent unbounded memory growth, accumulation of unclosed file/database/network handles, and memory leaks inside loop bodies.
- **Detect:**
  - Accumulating objects or strings in unbounded global/outer collections inside long-running or batch loops without flushing or pagination.
  - Opening files, database connections, streams, or HTTP responses inside a loop body without closing them (missing `with`, `using`, `try-with-resources`).
  - Logging or buffering all processed items into an in-memory list in an infinite stream worker.
- **Evidence:**
  - `handle = open(path)` inside `for item in items:` without `with` context management or `handle.close()`.
  - `accumulator.append(data)` in a long-running polling loop causing OutOfMemoryError over time.
- **Avoid:**
  - Flagging intentional bounded aggregation where the total dataset is guaranteed to be small and memory footprint is negligible.
- **Remediation:**
  - Use scoped resource wrappers (`with`, `using`, `try-finally`) inside loop bodies.
  - Process items in bounded streaming batches or flush buffers periodically to persistent storage.
- **Severity:** High

---

## LPS09: State Convergence & Invariant Protection

- **Purpose:** Guarantee that iterative state machines, relaxation algorithms, and reconciliation loops terminate without infinite cycling or oscillation.
- **Detect:**
  - State machine transitions that oscillate indefinitely between two or more states (e.g., State A -> State B -> State A).
  - Iterative numerical approximations or reconciliation loops without an iteration cap or convergence epsilon tolerance.
  - Rules engines where rule applications trigger cyclical state mutations without dampening or visited state checks.
- **Evidence:**
  - `while current_state != TARGET_STATE:` without cycle detection or maximum step limit.
  - Floating point equality comparison `while val != target:` failing to converge due to precision roundoff.
- **Avoid:**
  - Flagging provably acyclic state transitions with guaranteed monotonic state progression.
- **Remediation:**
  - Add cycle detection (tracking seen state hashes) and a hard maximum step cap (`step < MAX_STEPS`).
  - Use tolerance thresholds (`abs(val - target) < EPSILON`) for numerical convergence loops.
- **Severity:** Medium

---

## LPS10: Boundary & Edge Condition Test Verification

- **Purpose:** Verify that test suites adequately test loops and recursive functions against empty collections, single-item collections, boundary off-by-one conditions, and termination limits.
- **Detect:**
  - Complex custom looping algorithms or batch processors tested only with typical middle-range datasets (e.g., exactly 5 items).
  - Missing tests for empty inputs (`[]`, `""`, `0`), single-element inputs (`[x]`), maximum boundary limits, or error conditions mid-iteration.
  - Pagination or retry logic lacking test cases simulating end-of-stream, token cycles, or timeout deadlines.
- **Evidence:**
  - Iterative processor has test cases only for happy-path lists with multiple items, with no tests asserting behavior on empty input or boundary limits.
- **Avoid:**
  - Flagging simple standard library iterations where standard container semantics are already covered by framework tests.
- **Remediation:**
  - Add dedicated test cases verifying behavior on empty collections, singletons, maximum batch limits, and pagination termination.
- **Severity:** Medium

