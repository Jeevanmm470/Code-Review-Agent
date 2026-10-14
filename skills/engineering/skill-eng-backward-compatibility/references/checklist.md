# Backward Compatibility Inspection Checklist & Rules Reference

Detailed rule definitions, detection patterns, evidence requirements, and remediation directions for `skill-eng-backward-compatibility`.

---

## BWC01: API Endpoint & Parameter Evolution

- **Purpose:** Prevent removing, renaming, or changing data types of existing public API endpoints, query parameters, route segments, or request payloads without versioning or fallback aliases.
- **Detect:**
  - Renaming an existing query parameter or payload property (e.g., `user_id` -> `account_id`) on an existing non-versioned endpoint.
  - Removing an active public endpoint or changing its HTTP method (e.g., `POST` -> `PUT`).
  - Changing the data type of an existing parameter (e.g., integer ID -> UUID string).
- **Evidence:** Diff showing deleted or renamed parameter/endpoint on an existing API route.
- **Avoid:** Flagging changes to internal private endpoints or endpoints clearly marked with a major version increment (e.g., `/api/v2/`).
- **Remediation:** Support both old and new parameter names simultaneously via fallback aliasing and mark the old parameter as deprecated.
- **Severity:** HIGH (CRITICAL if breaking core public ingress or primary mobile clients).

---

## BWC02: Field Optionality & Validation Tightening

- **Purpose:** Ensure newly introduced request fields are optional with defaults, and prevent tightening input validation on fields that existing clients submit.
- **Detect:**
  - Adding a non-optional/required field to an existing API request payload or DTO constructor without a default value.
  - Adding stricter validation constraints (e.g., shrinking string length from 255 to 50, adding non-null constraint) to existing inputs.
  - Rejecting previously valid payloads with 400/422 responses.
- **Evidence:** New field defined with required/non-null annotation on existing input model without a default.
- **Avoid:** New endpoints where no legacy clients exist, or fields with guaranteed default values.
- **Remediation:** Make new request fields optional with sensible default values or accept null.
- **Severity:** HIGH.

---

## BWC03: Response Payload & Property Preservation

- **Purpose:** Prevent removing existing response properties or altering response object structures relied upon by active consumers.
- **Detect:**
  - Deleting fields from JSON/gRPC response models.
  - Wrapping existing response objects inside new top-level envelopes (e.g., `{ data: ... }`) on unversioned endpoints.
  - Changing response field types (e.g., from string to array or boolean).
- **Evidence:** Deleted field in public response DTO or restructured response hierarchy.
- **Avoid:** Private responses consumed only by server-rendered templates within the same deployable artifact.
- **Remediation:** Retain the legacy response field alongside the new structure or introduce an opt-in query parameter/header.
- **Severity:** HIGH.

---

## BWC04: Database Schema Expand-and-Contract

- **Purpose:** Enforce multi-phase (expand-and-contract) schema migrations to support rolling deployments without downtime or lockups.
- **Detect:**
  - Dropping or renaming a database column in a single migration while old application versions are still running and reading/writing to it.
  - Adding a `NOT NULL` constraint without a `DEFAULT` to an existing table with existing rows.
  - Single-step column type alterations that break existing ORM queries during rolling pod updates.
- **Evidence:** Single migration file executing `ALTER TABLE DROP COLUMN` or `ALTER TABLE RENAME COLUMN` on active tables.
- **Avoid:** Newly created tables or single-tenant offline maintenance window deployments.
- **Remediation:** Execute expand-and-contract: (1) Add new column, (2) Dual-write and backfill, (3) Switch reads, (4) Drop old column in later release.
- **Severity:** CRITICAL (Causes hard application crashes during rolling deployment).

---

## BWC05: Persisted Data & Serialization Fidelity

- **Purpose:** Ensure stored entities, serialized disk files, caches, and session tokens can be deserialized across version upgrades and rollbacks.
- **Detect:**
  - Modifying serialized class structures (e.g., Java `Serializable` without `serialVersionUID`, Pickle, custom binary formats) in a way that rejects legacy saved records.
  - Removing fields from persisted JSON document stores (MongoDB, PostgreSQL JSONB) without fallback migration logic for legacy documents.
- **Evidence:** Deserializer throwing deserialization exceptions when loading records written by previous application versions.
- **Avoid:** Ephemeral in-memory caches configured with automatic eviction on miss.
- **Remediation:** Maintain tolerant deserialization (e.g., `@JsonIgnoreProperties(ignoreUnknown = true)`) and provide backward-compatible data transformers.
- **Severity:** HIGH.

---

## BWC06: Event & Webhook Schema Evolution

- **Purpose:** Guard message payloads, Kafka/RabbitMQ event schemas, and outgoing webhooks against breaking changes across decoupled consumers.
- **Detect:**
  - Removing or renaming fields in published event schemas.
  - Changing event topic names or event type discriminator headers without dual-publishing during migration.
  - Publishing new required fields to existing consumers that use strict schema validation (e.g., strict Protobuf/Avro).
- **Evidence:** Modified event publisher schema removing existing payload keys or altering event type strings.
- **Avoid:** Internal private event queues where producer and consumer are deployed atomically.
- **Remediation:** Maintain additive-only event schemas and dual-publish event types during migration windows.
- **Severity:** HIGH.

---

## BWC07: Configuration & Environment Key Continuity

- **Purpose:** Maintain backward compatibility for environment variables, config keys, default values, and CLI flags across deployment scripts.
- **Detect:**
  - Renaming an environment variable (e.g., `DB_HOST` -> `DATABASE_URL`) without supporting the old variable as a fallback.
  - Changing default configuration values in a way that alters operational behavior unexpectedly.
  - Making previously optional configuration parameters mandatory, breaking existing Docker/Helm deployments.
- **Evidence:** Config parser removing lookup for legacy environment variable name without fallback lookup.
- **Avoid:** Completely new application services or documented major configuration overhauls.
- **Remediation:** Check both new and legacy config keys with fallback precedence: `ENV.get("NEW_KEY") or ENV.get("OLD_KEY", default)`.
- **Severity:** MEDIUM (HIGH if causing immediate deployment container crash).

---

## BWC08: Enum & Status Domain Evolution

- **Purpose:** Prevent removing or re-ordering enum values and handle unknown incoming enum variants gracefully across distributed nodes.
- **Detect:**
  - Deleting or renaming enum members in database columns or API contracts.
  - Strict enum parsers crashing with unhandled exceptions when encountering unknown future enum values from upgraded producers.
- **Evidence:** Deleted enum variant or strict `Enum.valueOf()` call lacking fallback handling for unrecognized values.
- **Avoid:** Internal enums strictly isolated within a single function scope.
- **Remediation:** Mark legacy enum members deprecated rather than deleting, and use tolerant enum deserialization with an `UNKNOWN` fallback.
- **Severity:** MEDIUM.

---

## BWC09: Behavioral & Semantic Invariants

- **Purpose:** Guard documented business rules, status transitions, pagination mechanics, and error codes against silent regressions.
- **Detect:**
  - Changing error response status codes from `404` to `400` or altering specific error code strings relied upon by frontend error handlers.
  - Changing default sort order, pagination page index (e.g., 0-indexed to 1-indexed), or filter behavior without an explicit API version change.
- **Evidence:** Altered conditional logic changing established return status codes or default sorting behavior.
- **Avoid:** Fixing genuine defect bugs where previous behavior violated documented contracts.
- **Remediation:** Preserve semantic invariants or introduce configuration flags to opt in to new behaviors.
- **Severity:** MEDIUM.

---

## BWC10: Compatibility & Migration Test Coverage

- **Purpose:** Verify automated contract tests, migration rollback tests, and multi-version deserialization test suites exist to catch regressions.
- **Detect:**
  - Modifying public schemas or database migrations without contract or serialization compatibility tests.
  - Tests only verifying happy-path new formats while deleting assertions for legacy data formats.
- **Evidence:** Diff altering public contracts with no accompanying backward-compatibility test assertions.
- **Avoid:** Purely internal non-distributed utility refactorings.
- **Remediation:** Add automated compatibility tests asserting that legacy payloads and previous schema versions deserialize correctly.
- **Severity:** LOW.

