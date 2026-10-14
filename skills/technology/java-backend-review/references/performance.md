# Java Performance Reference

Provides Virtual Thread execution, JPA/Hibernate query optimization, and GC efficiency rules for **Performance Review Agent** (`skill-eng-performance`).

---

## Actionable Technology Rules

### JAVA-PERF-001: Thread Pinning on Java 21 Virtual Threads & Blocking I/O
- **Applies To**: Java 21 Virtual Threads (Project Loom), `synchronized` blocks, Spring WebFlux / MVC.
- **Behavior**: Executing blocking I/O inside `synchronized` blocks "pins" Virtual Threads to carrier OS threads, destroying throughput.
- **Inspect**: `synchronized` blocks wrapping blocking I/O calls or long database operations in Java 21+.
- **Violation**:
  ```java
  public synchronized String fetchData() { // Pins virtual thread to OS carrier thread!
      return restTemplate.getForObject(url, String.class);
  }
  ```
- **Evidence**: `synchronized` keyword wrapping HTTP/DB calls in Virtual Thread enabled applications.
- **False Positives**: Short in-memory CPU operations inside `synchronized` blocks.
- **Remediation**: Replace `synchronized` blocks with `ReentrantLock` (`lock.lock()`).
- **Engineering Skill Map**: `PERF01`, `PERF03`

---

### JAVA-PERF-002: JPA / Hibernate N+1 Queries & Read-Only Transactions
- **Applies To**: Spring Data JPA, Hibernate, `@Transactional`, `@Entity`.
- **Behavior**: Accessing `@OneToMany` / `@ManyToMany` lazy relationships in loops triggers N+1 SQL queries; omitting `readOnly = true` adds flush checks.
- **Inspect**: Repository queries lacking `@EntityGraph` or `JOIN FETCH`, and read endpoints lacking `@Transactional(readOnly = true)`.
- **Violation**:
  ```java
  List<UserEntity> users = userRepository.findAll(); // Lazy orders trigger N+1 in loop
  for (UserEntity u : users) { int count = u.getOrders().size(); } // N+1 SQL queries!
  ```
- **Evidence**: Calling lazy collection getters inside loops or missing `readOnly = true` on read-only service methods.
- **False Positives**: Explicitly configured eager fetch queries via `@EntityGraph(attributePaths = {"orders"})`.
- **Remediation**: Use `@EntityGraph` or `JOIN FETCH` queries, and mark read service methods `@Transactional(readOnly = true)`.
- **Engineering Skill Map**: `PERF02`, `PERF04`

---

### JAVA-PERF-003: RestTemplate / WebClient Socket Descriptor Exhaustion
- **Applies To**: `RestTemplate`, `WebClient`, `HttpURLConnection`, Apache HttpClient.
- **Behavior**: Instantiating `new RestTemplate()` per request or using default `SimpleClientHttpRequestFactory` lacks connection pooling, exhausting sockets.
- **Inspect**: `new RestTemplate()` calls in services or `WebClient` instantiated without pooled `ConnectionProvider`.
- **Violation**: `RestTemplate restTemplate = new RestTemplate(); // Socket leak under load!`
- **Evidence**: Instantiation of `new RestTemplate()` inside method execution bodies.
- **False Positives**: RestTemplate beans configured at startup with pooled `HttpComponentsClientHttpRequestFactory`.
- **Remediation**: Inject a single pooled `RestTemplate` or `WebClient` bean configured with connection limits.
- **Engineering Skill Map**: `PERF05`, `PERF08`

---

### JAVA-PERF-004: Garbage Collection Pressure & String Concatenation in Loops
- **Applies To**: String manipulation, byte buffers, GC heap allocations.
- **Behavior**: String concatenation (`str += item`) inside loops creates thousands of transient `StringBuilder` instances, driving high GC pauses.
- **Inspect**: String concatenation in loops (`for` / `while`) or large buffer allocations (`new byte[10_000_000]`).
- **Violation**: `String csv = ""; for (Item i : items) { csv += i.getId() + ","; } // Heavy GC pressure`
- **Evidence**: String `+=` concatenation inside loop bodies.
- **False Positives**: Fixed string concatenation of 2–3 literals outside loops compiled to `invokedynamic`.
- **Remediation**: Use explicit `StringBuilder` initialized with estimated capacity or `StringJoiner`.
- **Engineering Skill Map**: `PERF06`, `PERF09`

---

### JAVA-PERF-005: Hibernate Batch Insert & SaveInLoop Anti-Pattern
- **Applies To**: Spring Data JPA `save()`, `saveAll()`, Hibernate batching (`hibernate.jdbc.batch_size`).
- **Behavior**: Calling `repository.save()` inside iteration loops executes individual SQL insert transactions instead of batched inserts.
- **Inspect**: Loop invoking `repository.save()` per item and missing `spring.jpa.properties.hibernate.jdbc.batch_size` in config.
- **Violation**: `for (User u : users) { userRepository.save(u); } // N single DB roundtrips!`
- **Evidence**: Invocation of `repository.save()` inside a `for` or `while` loop.
- **False Positives**: Isolated updates requiring independent transaction commit boundaries per item.
- **Remediation**: Call `repository.saveAll(entities)` and configure `hibernate.jdbc.batch_size=50`.
- **Engineering Skill Map**: `PERF02`, `PERF07`

---

### JAVA-PERF-006: Unbounded ThreadPoolTaskExecutor Queue Bottlenecks
- **Applies To**: Spring `@Async`, `ThreadPoolTaskExecutor`, `Executors.newFixedThreadPool`.
- **Behavior**: Default `ThreadPoolTaskExecutor` queue capacity is `Integer.MAX_VALUE`. Under high load, queued tasks cause OOM heap exhaustion.
- **Inspect**: Async executors created without explicit `queueCapacity` or using `Executors.newUnbounded...`.
- **Violation**:
  ```java
  ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
  exec.setCorePoolSize(10); exec.initialize(); // Queue capacity defaults to Integer.MAX_VALUE!
  ```
- **Evidence**: `ThreadPoolTaskExecutor` instantiation missing explicit `setQueueCapacity()` call.
- **False Positives**: Low-throughput internal workers protected by upstream rate limiters.
- **Remediation**: Set explicit queue capacity (`exec.setQueueCapacity(500)`) and `RejectedExecutionHandler`.
- **Engineering Skill Map**: `PERF03`, `PERF10`

