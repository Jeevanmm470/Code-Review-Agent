# Java Business Logic Reference

Provides API response contracts, JPA optimistic locking, Outbox pattern, and domain testability rules for **Business Logic Review Agent** (`skill-eng-business-logic`).

---

## Actionable Technology Rules

### JAVA-BIZ-001: HTTP Response Contract Mismatches & Error Payloads
- **Applies To**: Spring MVC `@RestController`, `ResponseEntity`, `@ExceptionHandler`.
- **Behavior**: Returning `200 OK` with error payloads (`{ "success": false }`) or `500` for validation errors violates HTTP contracts.
- **Inspect**: Controller methods returning `ResponseEntity.ok(new ErrorResponse(...))` on validation or domain rule failures.
- **Violation**:
  ```java
  if (amount <= 0) return ResponseEntity.ok(new ApiResponse(false, "Invalid amount")); // HTTP 200 contract mismatch!
  ```
- **Evidence**: Action returning `ResponseEntity.ok()` with explicit failure indicator fields (`success = false`).
- **False Positives**: Custom GraphQL endpoints or legacy RPC wrappers designed around HTTP 200 contracts.
- **Remediation**: Return standard HTTP error status codes (`ResponseEntity.badRequest().body(ProblemDetail.forStatusAndDetail(...))`).
- **Engineering Skill Map**: `BIZ01`, `BIZ04`

---

### JAVA-BIZ-002: DTO Jackson Deserialization & Validation Mismatches
- **Applies To**: Jackson `@JsonProperty`, `@Valid`, `@NotNull`, `@Size`, Fluent Validation.
- **Behavior**: Mismatches between Java camelCase fields and contract JSON names without `@JsonProperty` cause silent null deserialization.
- **Inspect**: DTO classes receiving snake_case JSON keys without `@JsonProperty("snake_case")` or missing `@Valid` on `@RequestBody`.
- **Violation**:
  ```java
  public class WebhookRequest { private String transactionId; } // Silent null when JSON sends "transaction_id"
  ```
- **Evidence**: DTO field name differing from contract JSON key without `@JsonProperty` annotation.
- **False Positives**: Global Jackson property naming strategy (`PropertyNamingStrategies.SNAKE_CASE`) configured in Spring.
- **Remediation**: Annotate DTO fields explicitly with `@JsonProperty("transaction_id")` and validate inputs with `@Valid`.
- **Engineering Skill Map**: `BIZ02`, `BIZ05`

---

### JAVA-BIZ-003: JPA / Hibernate Optimistic Concurrency Controls
- **Applies To**: JPA `@Entity`, `@Version`, `OptimisticLockException`.
- **Behavior**: Mutating shared financial balances or stock quantities without `@Version` tokens permits lost updates under concurrent load.
- **Inspect**: JPA entities with mutable balance or stock properties missing a `@Version` annotated field.
- **Violation**: `@Entity public class Product { private Long id; private Integer stock; } // Missing @Version token!`
- **Evidence**: Entity with mutable concurrent state lacking `@Version Long version` property.
- **False Positives**: Append-only audit log entities or immutable single-owner models.
- **Remediation**: Add `@Version private Long version;` to the entity and catch `ObjectOptimisticLockingFailureException`.
- **Engineering Skill Map**: `BIZ03`, `BIZ06`

---

### JAVA-BIZ-004: Outbox Pattern & Transactional Event Consistency
- **Applies To**: `@TransactionalEventListener`, ApplicationEventPublisher, Kafka / RabbitMQ.
- **Behavior**: Publishing event bus messages directly before/after `repository.save()` leads to distributed state inconsistencies if DB commit fails.
- **Inspect**: Direct `kafkaTemplate.send()` or `rabbitTemplate.convertAndSend()` inside `@Transactional` methods.
- **Violation**:
  ```java
  @Transactional public void createOrder(Order order) {
      kafkaTemplate.send("orders", new OrderCreatedEvent(order.getId())); // Event sent before DB transaction commits!
      orderRepository.save(order);
  }
  ```
- **Evidence**: Message bus `send` call executed directly inside `@Transactional` method body.
- **False Positives**: Usage of `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)` or a transactional Outbox entity.
- **Remediation**: Persist event to an Outbox table in the same transaction or use `@TransactionalEventListener(AFTER_COMMIT)`.
- **Engineering Skill Map**: `BIZ07`, `BIZ08`

---

### JAVA-BIZ-005: Domain Invariants & Aggregate Root Encapsulation
- **Applies To**: Domain entities, aggregate roots, encapsulation.
- **Behavior**: Public setters on entity state properties (`public void setBalance(BigDecimal balance)`) allow callers to bypass domain invariants.
- **Inspect**: Domain entities exposing public setters for state governed by business validation rules.
- **Violation**: `public class Account { public void setBalance(BigDecimal balance) { this.balance = balance; } } // Allows negative balance!`
- **Evidence**: Public setter on domain entity property representing state governed by validation rules.
- **False Positives**: Simple Anemic DTO records or models used strictly for API data transfer.
- **Remediation**: Hide setters (`protected` / `private`) and mutate state exclusively via explicit domain methods (`deposit(amount)`).
- **Engineering Skill Map**: `BIZ02`, `BIZ09`

---

### JAVA-BIZ-006: Integration Test Isolation & Testcontainers Strategy
- **Applies To**: `@SpringBootTest`, `@DataJpaTest`, H2 Database, Testcontainers.
- **Behavior**: Using in-memory H2 DB for repository integration tests fails to catch PostgreSQL/MySQL native SQL constraints or dialect bugs.
- **Inspect**: Integration test classes configuring `jdbc:h2:mem` to validate complex native SQL queries or database procedures.
- **Violation**: `spring.datasource.url=jdbc:h2:mem:testdb // H2 fails to enforce native PostgreSQL constraints`
- **Evidence**: Repository integration test using H2 in-memory DB for native SQL repository validation.
- **False Positives**: Simple unit tests mocking repository interfaces with Mockito.
- **Remediation**: Use Testcontainers (`@Container static PostgreSQLContainer<?> postgres = ...`) for integration testing.
- **Engineering Skill Map**: `BIZ10`, `BIZ12`

