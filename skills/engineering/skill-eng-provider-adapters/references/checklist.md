# Provider Adapters and Multi-Provider Consistency Inspection Checklist

This checklist defines concrete review rules (`ADP01`–`ADP10`), detection patterns, code anti-patterns, remediation guidance, and false-positive safeguards for multi-provider integrations, adapter boundaries, canonical data normalization, and capability differences across Python, Java, C#, Go, and TypeScript.

---

## Rule Index

| ID | Rule | Objective |
|---|---|---|
| `ADP01` | Domain Boundary & SDK Isolation | Prevent provider-specific SDK classes, response types, and headers from leaking into domain/application layers. |
| `ADP02` | Canonical Contract & Data Normalization | Ensure provider payloads, statuses, enums, and IDs are mapped consistently into normalized domain models. |
| `ADP03` | Provider Capability & Unsupported Operations | Explicitly handle unsupported provider features without returning misleading successes or partial data. |
| `ADP04` | Explicit Provider Selection & Scoping | Ensure provider selection is explicit, validated, and strictly scoped to authenticated tenant configuration. |
| `ADP05` | Error Translation & Diagnostic Integrity | Translate provider-specific HTTP/SDK exceptions into domain error contracts while preserving diagnostic context. |
| `ADP06` | Pagination Normalization & Complete Traversal | Normalize disparate provider pagination models (cursor, offset, page token) to prevent silent truncation. |
| `ADP07` | Rate Limit & Quota Alignment | Translate provider rate-limit and quota headers (`Retry-After`, `X-RateLimit-*`) into unified throttle signals. |
| `ADP08` | Authentication & Credential Isolation | Prevent provider credentials and access tokens from cross-contaminating requests or multi-tenant sessions. |
| `ADP09` | Versioning & Backward Compatibility | Guard shared contracts against breaking schema changes, new enum values, or deprecated provider endpoints. |
| `ADP10` | Multi-Provider Contract Test Coverage | Validate adapter implementations against shared contract test suites to guarantee behavioral substitutability. |

---

## Detailed Rule Checklist

### ADP01: Domain Boundary & SDK Isolation
- **Purpose:** Ensure application core and business services remain decoupled from specific third-party provider SDK objects and classes.
- **Detect:** Domain models importing provider SDK packages (e.g. `github.PullRequest`, `com.stripe.model.PaymentIntent`, `@azure/storage-blob`) or service interfaces returning raw SDK types.
- **Evidence:** Domain interfaces returning third-party SDK class instances rather than domain dataclasses or records.
- **Avoid:**
  ```python
  # BAD: Exposes PyGithub SDK types directly in domain service interface
  from github import PullRequest

  class CodeReviewService:
      def get_pr_details(self, repo: str, pr_num: int) -> PullRequest:
          return self.github_client.get_repo(repo).get_pull(pr_num)
  ```
- **Remediation:**
  ```python
  # GOOD: Returns normalized domain model from adapter
  class CodeReviewService:
      def get_pr_details(self, repo: str, pr_num: int) -> CanonicalPullRequest:
          gh_pr = self.github_client.get_repo(repo).get_pull(pr_num)
          return CanonicalPullRequest(id=str(gh_pr.id), title=gh_pr.title, author=gh_pr.user.login)
  ```
- **Severity:** High (Base Deduction: 4.0).

### ADP02: Canonical Contract & Data Normalization
- **Purpose:** Prevent disparate provider payload formats, status codes, and enums from creating accidental business inconsistencies.
- **Detect:** Dropped critical fields (e.g., timestamps, timezone mismatches), inconsistent status mapping (e.g. mapping GitLab `opened` vs GitHub `open`), or unhandled optional fields.
- **Evidence:** Status translations missing specific provider enum states or defaulting unknown states to active/success.
- **Avoid:**
  ```csharp
  // BAD: Inconsistent status mapping causes GitLab PRs to be treated as closed
  public ReviewStatus MapStatus(string providerStatus) {
      return providerStatus == "open" ? ReviewStatus.Open : ReviewStatus.Closed; // GitLab returns "opened"
  }
  ```
- **Remediation:**
  ```csharp
  // GOOD: Comprehensive status mapping covering all provider variants
  public ReviewStatus MapStatus(string providerStatus) {
      return providerStatus?.ToLowerInvariant() switch {
          "open" or "opened" => ReviewStatus.Open,
          "closed" or "merged" => ReviewStatus.Closed,
          "draft" => ReviewStatus.Draft,
          _ => ReviewStatus.Unknown
      };
  }
  ```
- **Severity:** High (Base Deduction: 4.0).

### ADP03: Provider Capability & Unsupported Operations
- **Purpose:** Ensure applications handle operations that a specific provider does not support without silent failures or misleading successes.
- **Detect:** Returning empty lists or dummy successes when an integrated provider lacks support for a required capability (e.g., branch protection rules, inline draft comments).
- **Evidence:** Empty catch or no-op implementation of a required port method on a capability-limited provider.
- **Avoid:**
  ```java
  // BAD: Silently succeeds when provider does not support inline suggestions
  public void addInlineSuggestion(String commentId, String suggestion) {
      // Bitbucket server doesn't support this API; silently ignored
  }
  ```
- **Remediation:**
  ```java
  // GOOD: Explicitly throw UnsupportedCapabilityException or check capability flag
  public void addInlineSuggestion(String commentId, String suggestion) {
      throw new UnsupportedProviderCapabilityException("Bitbucket Server does not support inline suggestions");
  }
  ```
- **Severity:** High (Base Deduction: 4.0).

### ADP04: Explicit Provider Selection & Scoping
- **Purpose:** Ensure provider factory resolution is deterministic, strictly validated, and scoped to tenant/organization settings.
- **Detect:** Resolving provider adapters based on unvalidated string inputs, fallback to default provider on invalid input, or cross-tenant provider credential leakage.
- **Evidence:** Unvalidated dictionary lookup returning default adapter when tenant requests unsupported provider.
- **Avoid:**
  ```typescript
  // BAD: Falls back to default provider on unknown provider name
  function getAdapter(providerName: string): VCSAdapter {
      return adapters[providerName] || adapters['github'];
  }
  ```
- **Remediation:**
  ```typescript
  // GOOD: Explicit validation and fail-fast resolution
  function getAdapter(providerName: string): VCSAdapter {
      const adapter = adapters[providerName];
      if (!adapter) throw new UnsupportedProviderException(`Unknown provider: ${providerName}`);
      return adapter;
  }
  ```
- **Severity:** High (Base Deduction: 4.0).

### ADP05: Error Translation & Diagnostic Integrity
- **Purpose:** Prevent third-party provider exceptions from leaking into domain layers while preserving root-cause diagnostic information.
- **Detect:** Raw `Octokit.ApiException`, `StripeException`, or `AmazonServiceException` uncaught in adapter, or caught and re-thrown as generic `Exception` losing status codes.
- **Evidence:** Direct exposure of provider exception classes in domain service signatures.
- **Avoid:**
  ```python
  # BAD: Lets GithubException bubble directly to API controllers
  def get_file_content(self, path: str):
      return self.repo.get_contents(path) # May raise GithubException(404)
  ```
- **Remediation:**
  ```python
  # GOOD: Translate to canonical domain exceptions with cause chaining
  def get_file_content(self, path: str):
      try:
          return self.repo.get_contents(path)
      except GithubException as e:
          if e.status == 404:
              raise ResourceNotFoundException(f"File not found: {path}") from e
          raise ProviderIntegrationException(f"GitHub API error: {e.data}") from e
  ```
- **Severity:** High (Base Deduction: 4.0).

### ADP06: Pagination Normalization & Complete Traversal
- **Purpose:** Provide a uniform pagination abstraction across providers utilizing different pagination styles (cursor, link header, offset/limit, continuation tokens).
- **Detect:** Adapter exposing provider-specific pagination tokens directly to domain consumers or assuming all providers use numerical 1-based page indexing.
- **Evidence:** Forcing cursor-based provider into offset-based interface resulting in broken queries.
- **Avoid:**
  ```python
  # BAD: Assumes all VCS providers support offset-based page numbers
  def list_commits(self, repo: str, page: int, limit: int):
      # Azure DevOps uses continuation tokens, not integer pages!
      return self.azdo_client.get_commits(repo, top=limit, skip=page * limit)
  ```
- **Remediation:**
  ```python
  # GOOD: Use canonical cursor/iterator pattern across all provider adapters
  def list_commits(self, repo: str, cursor: Optional[str], limit: int) -> Page[CanonicalCommit]:
      # Properly adapts provider token to canonical Page container
  ```
- **Severity:** High (Base Deduction: 4.0).

### ADP07: Rate Limit & Quota Alignment
- **Purpose:** Translate heterogeneous rate limiting headers (`X-RateLimit-Reset`, `Retry-After`) into a uniform throttle model.
- **Detect:** Hardcoding fixed retry wait times or ignoring provider-specific rate limit status signals (e.g. GitHub secondary rate limits vs GitLab 429).
- **Evidence:** Catching rate limit errors without extracting provider retry-after headers.
- **Avoid:**
  ```typescript
  // BAD: Ignores provider retry-after and uses arbitrary 1 second delay
  if (err.status === 429) {
      await sleep(1000);
      return retry();
  }
  ```
- **Remediation:**
  ```typescript
  // GOOD: Extract provider retry header and adapt to standardized ThrottleException
  if (err.status === 429) {
      const retryAfter = parseProviderRetryAfter(err.headers);
      throw new RateLimitExceededException(retryAfter);
  }
  ```
- **Severity:** Medium (Base Deduction: 2.0).

### ADP08: Authentication & Credential Isolation
- **Purpose:** Prevent credentials, OAuth tokens, or PATs from cross-contaminating requests or multi-tenant sessions.
- **Detect:** Storing client access tokens in singleton adapter fields or static dictionaries indexed by user ID without thread safety or tenant scoping.
- **Evidence:** Storing mutable request-scoped auth tokens in shared singleton adapter instances.
- **Avoid:**
  ```java
  // BAD: Mutable token on singleton adapter creates race condition across concurrent requests
  @Component
  public class GitHubAdapter {
      private String currentAuthToken;
      public void setToken(String token) { this.currentAuthToken = token; }
  }
  ```
- **Remediation:**
  ```java
  // GOOD: Pass request-scoped credentials via method parameters or scoped context
  @Component
  public class GitHubAdapter {
      public CanonicalRepo getRepo(TenantAuthContext auth, String repoId) {
          GitHub client = gitHubClientFactory.create(auth.getToken());
          return mapRepo(client.getRepo(repoId));
      }
  }
  ```
- **Severity:** Critical (Base Deduction: 6.0).

### ADP09: Versioning & Backward Compatibility
- **Purpose:** Protect shared contracts from breaking when external providers introduce new enum fields or deprecate API endpoints.
- **Detect:** Strict JSON deserializers throwing exceptions on unrecognized new enum values or new fields in third-party provider responses.
- **Evidence:** Deserializer configured without `ignoreUnknown` or missing default enum fallback.
- **Avoid:**
  ```csharp
  // BAD: Throws exception if GitHub adds a new event type enum
  [JsonConverter(typeof(JsonStringEnumConverter))]
  public enum GitHubEventType { Push, PullRequest } // Fails on new event types
  ```
- **Remediation:**
  ```csharp
  // GOOD: Configure unknown enum fallback handling
  public enum GitHubEventType { Unknown, Push, PullRequest }
  ```
- **Severity:** Medium (Base Deduction: 2.0).

### ADP10: Multi-Provider Contract Test Coverage
- **Purpose:** Ensure all provider adapters pass identical contract test suites to guarantee true behavioral substitutability.
- **Detect:** Testing only one adapter (e.g. GitHub) while leaving secondary adapters (GitLab, Bitbucket) untested against common port contracts.
- **Evidence:** Missing parameterized or shared contract tests across all concrete adapter implementations.
- **Avoid:**
  ```python
  # BAD: Only tests GitHubAdapter; GitLabAdapter behavior remains unverified
  def test_github_adapter_maps_commits():
      adapter = GitHubAdapter()
      assert adapter.get_commits("repo")[0].author is not None
  ```
- **Remediation:**
  ```python
  # GOOD: Shared contract test suite executed against all registered adapters
  @pytest.mark.parametrize("adapter_factory", [GitHubAdapter, GitLabAdapter, BitbucketAdapter])
  def test_vcs_adapter_contract_maps_commits(adapter_factory):
      adapter = adapter_factory()
      result = adapter.get_commits("mock_repo")
      assert isinstance(result[0], CanonicalCommit)
  ```
- **Severity:** Medium (Base Deduction: 2.0).

