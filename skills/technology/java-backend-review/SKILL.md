---
name: java-backend-review
description: >-
  Activate when reviewing Java backend code, Java source files (.java), Spring Boot application
  controllers or REST endpoints, Spring Data JPA / Hibernate persistence, Dependency Injection
  (@Autowired, @Bean), Java Concurrency (Virtual Threads), or JVM runtime execution. Provides Java,
  Spring Boot, JPA, and JVM technology guidance to specialist engineering review agents.
---

# Java Backend Review Technology Skill

## 1. Purpose & Scope

Provides Java language semantics, Spring Boot framework mechanics, Spring Data JPA / Hibernate persistence behavior, and JVM runtime execution rules for Code Review Agent workflows.

**Activate when** code changes modify `.java`, `pom.xml`, `build.gradle`, `application.yml`, `application.properties`, Spring Boot REST controllers, Spring Data JPA repositories, dependency injection configurations, background tasks, or Maven/Gradle manifests.

## 2. Progressive Disclosure & Agent Selective Loading

This skill separates technology knowledge into five independent reference files. Each specialist review agent consumes **only** the reference corresponding to its review dimension:

| Specialist Review Agent | Engineering Skill | Java Reference File |
|---|---|---|
| **Modularity Agent** | `skill-eng-modularity` | [`references/modularity.md`](references/modularity.md) |
| **Maintainability Agent** | `skill-eng-maintainability` | [`references/maintainability.md`](references/maintainability.md) |
| **Performance Agent** | `skill-eng-performance` | [`references/performance.md`](references/performance.md) |
| **Security Agent** | `skill-eng-security` | [`references/security.md`](references/security.md) |
| **Business Logic Agent** | `skill-eng-business-logic` | [`references/business-logic.md`](references/business-logic.md) |

### Selective Loading Contract for Orchestration
- Agents MUST load only their assigned dimension reference file during single-dimension review runs.
- Do NOT load all reference files into a single agent prompt context unless cross-dimensional analysis is explicitly commanded by the orchestrator.
- The engineering skills define evaluation principles and scorecard schemas; this technology skill provides framework mechanics and concrete detection rules.

## 3. Technology Guidance vs. Engineering Scoring

- **Technology Skill Responsibility**: Define Java, Spring Boot, JPA, and JVM execution mechanics, detection rules (`JAVA-MOD-001`–`JAVA-BIZ-006`), false-positive safeguards, and code evidence requirements.
- **Engineering Skill Responsibility**: Evaluate architectural impact, calculate dimension scores (0.0–10.0 scale), enforce deduction formulas, and format findings in the Scorecard Aggregator schema.
- This technology skill does **not** override general engineering scoring rubrics or generate a separate numeric score.

## 4. Version Awareness & Target Framework Detection

Inspect project build manifests (`pom.xml`, `build.gradle`) to detect active Java LTS versions and Spring Boot levels:

- **Java 17 (LTS)**: Records, Pattern Matching (`instanceof`), Sealed classes, Text Blocks, Spring Boot 3.0+ baseline.
- **Java 21 (LTS)**: Virtual Threads (Project Loom), Record Patterns, Pattern Matching for `switch`, Sequenced Collections, Spring Boot 3.2+ features.

*Rule Applicability Guardrail*: Do NOT recommend APIs or syntax unsupported by the repository's target Java version (`<java.version>` / `sourceCompatibility`).

## 5. Supporting References & Validation

- **Modularity Reference**: [`references/modularity.md`](references/modularity.md)
- **Maintainability Reference**: [`references/maintainability.md`](references/maintainability.md)
- **Performance Reference**: [`references/performance.md`](references/performance.md)
- **Security Reference**: [`references/security.md`](references/security.md)
- **Business Logic Reference**: [`references/business-logic.md`](references/business-logic.md)
- **Validation Suite**: [`validation/test-suite.json`](validation/test-suite.json)

