# Java Modularity & Architecture Reference

Provides Java dependency injection, package boundary, and Spring framework modularity rules for **Modularity Review Agent** (`skill-eng-modularity`).

---

## Actionable Technology Rules

### JAVA-MOD-001: Scope Mismatch & Prototype Injection into Singleton Bean
- **Applies To**: Spring Container `@Component`, `@Service`, `@Scope("prototype")`, `@Scope("singleton")`.
- **Behavior**: Injecting a Prototype bean directly into a Singleton bean instantiates the prototype only once, locking instance state across requests.
- **Inspect**: Singleton beans storing stateful Prototype dependencies as instance fields without `@Lookup` or `ObjectProvider<T>`.
- **Violation**:
  ```java
  @Service // Singleton scope by default
  public class OrderProcessor {
      @Autowired private ShoppingCart cart; // Prototype bean captured forever!
  }
  ```
- **Evidence**: `@Service`/`@Component` (Singleton) containing `@Autowired` field of a `@Scope("prototype")` bean.
- **False Positives**: Resolving prototype instances via `ObjectProvider<T>.getObject()` or `@Lookup` method injection.
- **Remediation**: Use `ObjectProvider<T>` or `@Lookup` to fetch prototype instances dynamically per request.
- **Engineering Skill Map**: `MOD02`, `MOD04`

---

### JAVA-MOD-002: Field Injection Anti-Pattern via @Autowired
- **Applies To**: Spring components, services, controllers.
- **Behavior**: Using `@Autowired` directly on private fields prevents constructor immutability, complicates unit testing without Spring context, and hides dependency growth.
- **Inspect**: Classes using `@Autowired` on fields instead of constructor injection or Lombok `@RequiredArgsConstructor`.
- **Violation**:
  ```java
  @Service
  public class PaymentService {
      @Autowired private OrderRepository orderRepository; // Field injection!
  }
  ```
- **Evidence**: Field-level `@Autowired` annotation on private fields.
- **False Positives**: Test classes (`@SpringBootTest`) where field injection is standard convention.
- **Remediation**: Use constructor injection with `final` fields or Lombok `@RequiredArgsConstructor`.
- **Engineering Skill Map**: `MOD01`, `MOD02`

---

### JAVA-MOD-003: JPA Repository / EntityManager Leakage Across Boundaries
- **Applies To**: Spring MVC / WebFlux controllers, domain entities, `JpaRepository`, `EntityManager`.
- **Behavior**: Exposing Spring Data `JpaRepository` or JPA entities directly to Web API controllers couples HTTP interfaces to DB schemas.
- **Inspect**: Controller endpoints accepting or returning raw `@Entity` classes or repository interfaces injected into controllers.
- **Violation**:
  ```java
  @GetMapping("/users")
  public List<UserEntity> getUsers() { return userRepository.findAll(); } // Leaks entity to HTTP client
  ```
- **Evidence**: Controller class injecting `JpaRepository` directly or returning JPA `@Entity` types in public methods.
- **False Positives**: Lightweight CRUD microservices where DTO mapping is explicitly waived by repository standards.
- **Remediation**: Inject Application/Domain Services into controllers and map entities to DTOs.
- **Engineering Skill Map**: `MOD03`, `MOD09`

---

### JAVA-MOD-004: Circular Package and Module Dependencies
- **Applies To**: Java package imports, Maven/Gradle module dependencies, Spring bean references.
- **Behavior**: Bidirectional imports between packages (e.g. `com.app.domain` importing `com.app.infrastructure`) break architectural layer isolation.
- **Inspect**: Cycles in package imports or Spring `BeanCurrentlyInCreationException` circular dependencies.
- **Violation**: Domain package importing persistence classes (`import com.app.infrastructure.persistence.UserDao;`).
- **Evidence**: Class in core domain importing infrastructure/database specific packages.
- **False Positives**: Inter-package calls within monolithic test harnesses.
- **Remediation**: Invert dependencies by defining domain interfaces and implementing them in infrastructure packages.
- **Engineering Skill Map**: `MOD02`, `MOD12`

---

### JAVA-MOD-005: Property Key Coupling & Uncentralized @Value Injection
- **Applies To**: Spring `@Value("${...}")`, `Environment`, `@ConfigurationProperties`.
- **Behavior**: Injecting raw `@Value("${app.stripe.key}")` strings into domain services creates fragmented, unvalidated property lookups.
- **Inspect**: Business classes using `@Value` annotations instead of strongly-typed `@ConfigurationProperties` classes.
- **Violation**:
  ```java
  @Service
  public class StripeService {
      @Value("${stripe.api.key}") private String apiKey; // Fragmented string config lookup
  }
  ```
- **Evidence**: Domain service using `@Value` for configuration keys instead of `@ConfigurationProperties` POCOs.
- **False Positives**: Simple `@Value` injections in standalone infrastructure configuration classes.
- **Remediation**: Group settings into strongly-typed `@ConfigurationProperties` classes with `@Validated` annotations.
- **Engineering Skill Map**: `MOD01`, `MOD08`

---

### JAVA-MOD-006: Monolithic Configuration & @SpringBootApplication Pollution
- **Applies To**: `@SpringBootApplication`, `@Configuration`, Spring Boot startup.
- **Behavior**: Placing dozens of `@Bean` definitions, security rules, and CORS configs directly in the main class creates God configuration files.
- **Inspect**: Application entry point class (`Application.java`) containing inline `@Bean` definitions and configuration logic.
- **Evidence**: Main class annotated with `@SpringBootApplication` defining multiple domain beans or security filters inline.
- **False Positives**: Main class defining only `SpringApplication.run(Application.class, args)`.
- **Remediation**: Move bean definitions into modular, domain-focused `@Configuration` classes (`SecurityConfig`, `DatabaseConfig`).
- **Engineering Skill Map**: `MOD05`, `MOD11`

