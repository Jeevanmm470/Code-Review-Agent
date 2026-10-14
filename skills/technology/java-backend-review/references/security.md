# Java Security Reference

Provides Spring Security, JWT validation, SQL injection prevention, and secrets rules for **Security Review Agent** (`skill-eng-security`).

---

## Actionable Technology Rules

### JAVA-SEC-001: Spring Security Flaws & JWT Token Validation
- **Applies To**: Spring Security `SecurityFilterChain`, `JwtDecoder`, `NimbusJwtDecoder`.
- **Behavior**: Disabling CSRF without state-less session management or bypassing JWT signature checks accepts forged tokens.
- **Inspect**: `http.csrf(AbstractHttpConfigurer::disable)` with default session creation or custom JWT decoders omitting key validation.
- **Violation**:
  ```java
  @Bean public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
      return http.csrf(c -> c.disable()).authorizeHttpRequests(a -> a.anyRequest().permitAll()).build(); // Security bypass!
  }
  ```
- **Evidence**: `anyRequest().permitAll()` or disabled security filter chains on authenticated business routes.
- **False Positives**: Pure stateless REST APIs using JWT Bearer tokens where CSRF protection is unnecessary.
- **Remediation**: Enforce `SessionCreationPolicy.STATELESS` when disabling CSRF, and validate JWT signatures.
- **Engineering Skill Map**: `SEC01`, `SEC04`

---

### JAVA-SEC-002: Authorization Bypass & Missing @PreAuthorize Guards
- **Applies To**: Spring MVC controllers, `@PreAuthorize`, `@Secured`, `@RolesAllowed`.
- **Behavior**: Sensitive mutation methods lacking `@PreAuthorize("hasRole('ADMIN')")` permit unauthorized privilege escalation.
- **Inspect**: Controller mutation endpoints (`@PostMapping`, `@DeleteMapping`) missing method-level security annotations.
- **Violation**: `@DeleteMapping("/users/{id}") public void deleteUser(@PathVariable Long id) { userService.delete(id); } // No auth check!`
- **Evidence**: Sensitive endpoint signature lacking `@PreAuthorize` or path-level security matchers.
- **False Positives**: Explicit public endpoints (`/api/auth/login`, `/actuator/health`).
- **Remediation**: Annotate endpoints with `@PreAuthorize("hasAuthority('SCOPE_admin')")` and enable `@EnableMethodSecurity`.
- **Engineering Skill Map**: `SEC02`, `SEC05`

---

### JAVA-SEC-003: Mass Assignment & Jackson Unfiltered Deserialization
- **Applies To**: Spring MVC `@RequestBody`, Jackson deserialization, JPA Entities.
- **Behavior**: Binding HTTP request payloads directly to JPA `@Entity` classes allows clients to overwrite internal fields (`isAdmin`).
- **Inspect**: Controller actions receiving JPA `@Entity` parameters directly in `@RequestBody` signatures.
- **Violation**: `@PostMapping("/user") public User updateUser(@RequestBody User user) { return repo.save(user); } // Overposting risk!`
- **Evidence**: Controller method receiving a JPA `@Entity` type in `@RequestBody`.
- **False Positives**: Actions receiving dedicated request DTO records with explicit client fields.
- **Remediation**: Bind dedicated request DTO records (`public record UserRequest(...)`) and map properties explicitly.
- **Engineering Skill Map**: `SEC03`, `SEC07`

---

### JAVA-SEC-004: JPA / Native SQL Injection via Concatenation
- **Applies To**: `EntityManager.createNativeQuery`, `@Query(nativeQuery = true)`.
- **Behavior**: Concatenating strings (`"SELECT * FROM users WHERE name = '" + input + "'"` ) into native queries triggers SQL injection.
- **Inspect**: Invocations of `createNativeQuery` or `@Query` native strings using string concatenation `+`.
- **Violation**: `entityManager.createNativeQuery("SELECT * FROM users WHERE email = '" + email + "'"); // SQL Injection!`
- **Evidence**: `createNativeQuery` call site where SQL string parameter is dynamically concatenated with non-parameterized inputs.
- **False Positives**: Parameterized native queries using named parameters (`WHERE email = :email`).
- **Remediation**: Use parameterized bindings (`createNativeQuery("... WHERE email = :email").setParameter("email", email)`).
- **Engineering Skill Map**: `SEC03`, `SEC06`

---

### JAVA-SEC-005: Permissive CORS & Transport Security Misconfigurations
- **Applies To**: `@CrossOrigin`, `CorsConfiguration`, Spring Security `CorsConfigurer`.
- **Behavior**: Configuring CORS with `allowedOrigins("*")` alongside `allowCredentials(true)` exposes APIs to cross-origin credential theft.
- **Inspect**: `CorsConfiguration.setAllowedOrigins(List.of("*"))` or `@CrossOrigin(origins = "*")` on sensitive controllers.
- **Violation**: `@CrossOrigin(origins = "*") @RestController public class AccountController { ... } // Excessively permissive CORS`
- **Evidence**: CORS policy specifying wildcard origin `*` on endpoints handling ambient credentials.
- **False Positives**: Public open endpoints designed explicitly for unauthenticated cross-origin access.
- **Remediation**: Restrict allowed origins to explicitly configured domain lists read from `application.yml`.
- **Engineering Skill Map**: `SEC08`, `SEC09`

---

### JAVA-SEC-006: Hardcoded Secrets & Plaintext Credentials
- **Applies To**: `application.yml`, `application.properties`, Java source files.
- **Behavior**: Storing API keys, DB passwords, or signing keys directly in source code or `application.yml` risks credential leakage.
- **Inspect**: Hardcoded secret strings (`"sk_live_12345..."`) or plaintext passwords in `application.yml` committed to Git.
- **Violation**: `spring.datasource.password: super_secret_production_password // Plaintext secret in application.yml`
- **Evidence**: Hardcoded high-entropy secret string in source code or committed property files.
- **False Positives**: Placeholder environment variable references (`${DB_PASSWORD:default_dev_pass}`) in local dev profiles.
- **Remediation**: Reference environment variables (`${DB_PASSWORD}`) or Spring Cloud Vault / HashiCorp Vault.
- **Engineering Skill Map**: `SEC10`, `SEC11`

