# Java Maintainability Reference

Provides Java language idioms, nullability, exception handling, and resource management rules for **Maintainability Review Agent** (`skill-eng-maintainability`).

---

## Actionable Technology Rules

### JAVA-MAINT-001: Modern Java Idioms & Pattern Matching
- **Applies To**: Java source files (`.java`), Java 17 / 21 LTS features.
- **Behavior**: Verbose POCO classes with manual getters/setters, manual type casting after `instanceof`, and legacy `switch` statements increase verbosity.
- **Inspect**: Classes used purely as data holders instead of `record`, manual casts following `instanceof`, and multi-line `switch`.
- **Violation**:
  ```java
  public class UserDto { private String name; public String getName() { return name; } } // Verbose DTO
  if (obj instanceof String) { String s = (String) obj; return s.toUpperCase(); } // Verbose cast
  ```
- **Evidence**: Manual getters/setters on immutable DTOs or explicit type casts following `instanceof` checks in Java 17+.
- **False Positives**: Mutable JPA `@Entity` classes requiring zero-arg constructors and setters.
- **Remediation**: Use Java `record` (`public record UserDto(String name) {}`) and pattern matching for `instanceof` (`if (obj instanceof String s)`).
- **Engineering Skill Map**: `MAINT01`, `MAINT03`

---

### JAVA-MAINT-002: Null Safety, Optional Misuse & Guard Checks
- **Applies To**: `Optional<T>`, `@NonNull`, `@Nullable`, Objects null checks.
- **Behavior**: Calling `Optional.get()` without `isPresent()` throws `NoSuchElementException`; using `Optional` as method arguments adds overhead.
- **Inspect**: Direct `optional.get()` calls or `Optional<T>` parameters in method signatures.
- **Violation**: `String name = userRepository.findById(id).get().getName(); // NoSuchElementException risk!`
- **Evidence**: Direct `.get()` call on `Optional` instance without `isPresent()` or `orElseThrow()` guard.
- **False Positives**: `Optional` returned from repository interfaces or service query methods.
- **Remediation**: Use `orElseThrow()`, `orElse()`, or `map()` / `flatMap()` pipelines.
- **Engineering Skill Map**: `MAINT02`, `MAINT05`

---

### JAVA-MAINT-003: AutoCloseable Resource Leaks & Try-With-Resources
- **Applies To**: `InputStream`, `OutputStream`, `Connection`, `ResultSet`, `BufferedReader`.
- **Behavior**: Opening `AutoCloseable` resources without try-with-resources causes file descriptor and connection leaks.
- **Inspect**: Instantiating streams or JDBC resources without `try (...)` blocks.
- **Violation**:
  ```java
  FileInputStream fis = new FileInputStream(file); // Resource leak!
  byte[] data = fis.readAllBytes(); return data;
  ```
- **Evidence**: Instantiation of `AutoCloseable` resource without try-with-resources or explicit `.close()` in `finally`.
- **False Positives**: Resource lifecycle transferred to caller or managed by Spring container (`ResourceLoader`).
- **Remediation**: Wrap resource instantiation in `try (var fis = new FileInputStream(file)) { ... }`.
- **Engineering Skill Map**: `MAINT04`, `MAINT08`

---

### JAVA-MAINT-004: Exception Handling & Stack Trace Loss
- **Applies To**: `try-catch` blocks, custom exception hierarchy, exception re-throwing.
- **Behavior**: Catching `Exception` and throwing `new RuntimeException(e.getMessage())` loses the original cause and stack trace.
- **Inspect**: Catch blocks re-throwing new exceptions without passing original exception `e` as cause parameter.
- **Violation**: `catch (SQLException e) { throw new RuntimeException(e.getMessage()); } // Destroys cause stack trace!`
- **Evidence**: Exception constructor call omitting caught exception instance `e` as cause.
- **False Positives**: Intentionally masking internal system exception details at public security boundary layers.
- **Remediation**: Pass caught exception as cause (`throw new ServiceException("Failed to query user", e);`).
- **Engineering Skill Map**: `MAINT06`, `MAINT07`

---

### JAVA-MAINT-005: Static Analysis Compliance & Warning Suppression
- **Applies To**: `@SuppressWarnings`, SpotBugs, Checkstyle, SonarQube rules.
- **Behavior**: Indiscriminate `@SuppressWarnings("all")` or `@SuppressWarnings("unchecked")` hides runtime type safety defects.
- **Inspect**: Usage of `@SuppressWarnings` without documented technical rationale comments.
- **Evidence**: `@SuppressWarnings` annotation applied at class or broad method scope without explanatory comment.
- **False Positives**: Auto-generated code (MapStruct implementations, gRPC stubs, OpenAPI models).
- **Remediation**: Fix underlying type safety issue or narrow `@SuppressWarnings` scope to minimal line block.
- **Engineering Skill Map**: `MAINT01`, `MAINT09`

---

### JAVA-MAINT-006: DTO Immutability & API Contract Compatibility
- **Applies To**: Jackson DTOs, Lombok `@Data` vs `@Value`, API versioning.
- **Behavior**: Using mutable Lombok `@Data` on API request/response DTOs allows accidental state mutation; removing DTO fields breaks API clients.
- **Inspect**: Public DTOs using `@Data` instead of `@Value` or `record`, and removing/renaming public JSON fields.
- **Violation**: `@Data public class UserRequest { private String email; } // Mutable request DTO`
- **Evidence**: Mutable class annotations (`@Data`, public setters) on external API DTO models.
- **False Positives**: JPA `@Entity` classes requiring mutable setters for ORM state tracking.
- **Remediation**: Use Java `record` or Lombok `@Value` for immutable DTO contracts.
- **Engineering Skill Map**: `MAINT10`, `MAINT12`

