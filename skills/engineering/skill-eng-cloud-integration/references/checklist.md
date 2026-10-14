# Cloud Integration Inspection Checklist

This checklist defines concrete review rules (`CLD01`–`CLD10`), detection patterns, code anti-patterns, remediation guidance, and false-positive safeguards for cloud service and external infrastructure integrations across AWS, Azure, and GCP.

---

## Rule Index

| ID | Rule | Objective |
|---|---|---|
| `CLD01` | Cloud Identity & Managed Authentication | Prevent hardcoded cloud credentials and ensure correct managed identity or workload federation usage. |
| `CLD02` | Secrets Management & Dynamic Resolution | Prevent static secrets in source/config and ensure dynamic KMS/Secrets Manager resolution with rotation. |
| `CLD03` | Network Timeouts & Cancellation Propagation | Enforce explicit connect/read timeouts and deadline propagation on all external cloud API and SDK calls. |
| `CLD04` | Cloud SDK Client Lifecycle & Connection Reuse | Ensure cloud SDK clients and HTTP connection pools are reused rather than instantiated per-request. |
| `CLD05` | Cloud Pagination & Quota Control | Handle provider pagination tokens completely and enforce batching to prevent truncation and quota exhaustion. |
| `CLD06` | Transient Throttling & Backoff Alignment | Handle cloud rate limiting (HTTP 429/503) with jittered backoff without retrying non-idempotent side effects. |
| `CLD07` | Object Storage Streaming & Integrity | Prevent unbounded in-memory object buffering, ensure stream cleanup, and verify checksums on transfers. |
| `CLD08` | Object Path Safety & Access Scoping | Validate object keys against directory traversal and prevent unintended public bucket/container exposure. |
| `CLD09` | Cloud Resource Lifecycle & Cleanup | Ensure transient cloud resources (temp blobs, signed URLs, compute tasks) have explicit cleanup or TTLs. |
| `CLD10` | Infrastructure & Environment Parity | Prevent hardcoded environment endpoints and ensure production environments do not fall back to dev config. |

---

## Detailed Rule Checklist

### CLD01: Cloud Identity & Managed Authentication
- **Purpose:** Eliminate hardcoded access keys and enforce least-privilege cloud identity standards (AWS IAM Roles, Azure Managed Identity / DefaultAzureCredential, GCP Workload Identity).
- **Detect:** Plaintext access keys (`AKIA...`, storage account keys, service account JSON private keys) in source code or manual credential construction.
- **Evidence:** Instantiating SDK clients with static secret parameters or loading static key files from disk.
- **Avoid:**
  ```python
  # BAD: Hardcoded static access keys in SDK client initialization
  import boto3
  s3 = boto3.client('s3', aws_access_key_id='AKIAIOSFODNN7EXAMPLE', aws_secret_access_key='wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY')
  ```
- **Remediation:**
  ```python
  # GOOD: Leverage default credential provider chain with Workload Identity / IAM Role
  import boto3
  s3 = boto3.client('s3')
  ```
- **Severity:** Critical (Base Deduction: 6.0).

### CLD02: Secrets Management & Dynamic Resolution
- **Purpose:** Prevent secret exposure and ensure dynamic retrieval with rotation support from cloud secrets managers (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager).
- **Detect:** Secrets hardcoded into configuration files or caching secrets indefinitely in static variables without refresh/rotation mechanisms.
- **Evidence:** Storing raw connection strings or API keys in configuration files without reference to secret stores.
- **Avoid:**
  ```csharp
  // BAD: Database connection string with raw password committed in appsettings.json
  var connString = Configuration["Database:ConnectionStringWithPassword"];
  ```
- **Remediation:**
  ```csharp
  // GOOD: Resolve secret dynamically from Azure Key Vault or AWS Secrets Manager with caching TTL
  var secretClient = new SecretClient(new Uri(vaultUri), new DefaultAzureCredential());
  KeyVaultSecret secret = await secretClient.GetSecretAsync("DbPassword");
  ```
- **Severity:** Critical (Base Deduction: 6.0).

### CLD03: Network Timeouts & Cancellation Propagation
- **Purpose:** Prevent hanging requests, thread pool starvation, and unbounded execution delays during cloud service degradations.
- **Detect:** Cloud SDK or external HTTP client invocations without explicit connect and read timeouts or cancellation tokens.
- **Evidence:** Client initialization or request call with `timeout=None`, omitted timeout parameters, or ignoring `CancellationToken` / context.
- **Avoid:**
  ```python
  # BAD: Boto3 / requests call without network timeout configuration
  import requests
  response = requests.get(cloud_metadata_url) # Unbounded default timeout
  ```
- **Remediation:**
  ```python
  # GOOD: Explicit connect and read timeouts or Botocore config
  from botocore.config import Config
  config = Config(connect_timeout=3, read_timeout=10, retries={'max_attempts': 3})
  s3 = boto3.client('s3', config=config)
  ```
- **Severity:** High (Base Deduction: 4.0).

### CLD04: Cloud SDK Client Lifecycle & Connection Reuse
- **Purpose:** Prevent socket exhaustion, excessive TLS handshakes, and resource leakage by reusing SDK clients and underlying connection pools.
- **Detect:** Instantiating cloud SDK clients (e.g., `AmazonS3Client`, `BlobServiceClient`, `StorageClient`) inside request handlers or loops rather than as singletons/reusable beans.
- **Evidence:** `new BlobServiceClient(...)` or `boto3.client(...)` inside hot request paths.
- **Avoid:**
  ```java
  // BAD: Creating a new SDK client per request destroys connection pooling
  @PostMapping("/upload")
  public void uploadFile(@RequestBody byte[] data) {
      AmazonS3 s3 = AmazonS3ClientBuilder.standard().build();
      s3.putObject("my-bucket", "key", new ByteArrayInputStream(data), new ObjectMetadata());
  }
  ```
- **Remediation:**
  ```java
  // GOOD: Inject shared singleton S3 client with pooled connection manager
  @RestController
  public class UploadController {
      private final AmazonS3 s3;
      public UploadController(AmazonS3 s3) { this.s3 = s3; }
      @PostMapping("/upload")
      public void uploadFile(...) { s3.putObject(...); }
  }
  ```
- **Severity:** High (Base Deduction: 4.0).

### CLD05: Cloud Pagination & Quota Control
- **Purpose:** Prevent silent data truncation and rate limit exhaustion when querying multi-page cloud resources (e.g., listing S3 objects, DynamoDB scans, Azure resource lists).
- **Detect:** Calling list/query APIs and processing only the first page response without checking continuation tokens or utilizing SDK paginators.
- **Evidence:** Ignoring `NextContinuationToken`, `NextPageToken`, or `isTruncated`.
- **Avoid:**
  ```python
  # BAD: Processes only the first 1000 items and ignores continuation token
  response = s3.list_objects_v2(Bucket="my-bucket")
  for item in response.get("Contents", []):
      process(item)
  ```
- **Remediation:**
  ```python
  # GOOD: Use SDK paginator to seamlessly iterate through all items
  paginator = s3.get_paginator('list_objects_v2')
  for page in paginator.paginate(Bucket="my-bucket"):
      for item in page.get("Contents", []):
          process(item)
  ```
- **Severity:** High (Base Deduction: 4.0).

### CLD06: Transient Throttling & Backoff Alignment
- **Purpose:** Prevent retry storms against cloud APIs during throttling (HTTP 429, 503, AWS `ThrottlingException`, Azure `RequestRateTooLarge`).
- **Detect:** Retrying throttled cloud API calls immediately without exponential backoff and jitter, or retrying non-idempotent operations (e.g., resource provisioning).
- **Evidence:** Catching throttling errors and looping with fixed zero sleep.
- **Avoid:**
  ```typescript
  // BAD: Immediate retry loop on throttling causes cascading failure
  while (attempts < 5) {
      try { return await cloudService.provision(); }
      catch (e) { attempts++; } // Immediate retry
  }
  ```
- **Remediation:**
  ```typescript
  // GOOD: Exponential backoff with jitter and respect for Retry-After headers
  const backoffMs = Math.min(1000 * Math.pow(2, attempts) + Math.random() * 500, 10000);
  await new Promise(r => setTimeout(r, backoffMs));
  ```
- **Severity:** High (Base Deduction: 4.0).

### CLD07: Object Storage Streaming & Integrity
- **Purpose:** Prevent OutOfMemory (OOM) crashes on large file transfers and ensure data integrity via checksum verification.
- **Detect:** Loading multi-gigabyte blobs entirely into RAM byte arrays or failing to close storage stream handles.
- **Evidence:** Calling `.read()` or `.getBytes()` on unbounded object streams without streaming or chunking.
- **Avoid:**
  ```csharp
  // BAD: Reads entire 10GB cloud blob into memory buffer
  var blobClient = container.GetBlobClient("large-file.zip");
  var data = await blobClient.DownloadContentAsync();
  File.WriteAllBytes("large-file.zip", data.Value.Content.ToArray());
  ```
- **Remediation:**
  ```csharp
  // GOOD: Stream directly to destination file stream without buffering entire file in RAM
  var blobClient = container.GetBlobClient("large-file.zip");
  using var fileStream = File.OpenWrite("large-file.zip");
  await blobClient.DownloadToAsync(fileStream);
  ```
- **Severity:** High (Base Deduction: 4.0).

### CLD08: Object Path Safety & Access Scoping
- **Purpose:** Prevent directory traversal attacks on cloud object keys and accidental public bucket configuration.
- **Detect:** Concatenating user-supplied input directly into cloud object keys without sanitization, or generating public read URLs without expiration or access restriction.
- **Evidence:** `s3.put_object(Key=f"uploads/{user_filename}")` without path normalization, or creating public ACL objects.
- **Avoid:**
  ```python
  # BAD: User input '../target.txt' enables directory traversal or overwriting root keys
  key = f"user_files/{request.args['filename']}"
  s3.upload_fileobj(file_data, bucket, key)
  ```
- **Remediation:**
  ```python
  # GOOD: Sanitize file paths and use UUIDs or validated alphanumeric names
  filename = secure_filename(os.path.basename(request.args['filename']))
  key = f"user_files/{uuid.uuid4()}-{filename}"
  s3.upload_fileobj(file_data, bucket, key)
  ```
- **Severity:** Critical (Base Deduction: 6.0).

### CLD09: Cloud Resource Lifecycle & Cleanup
- **Purpose:** Prevent resource leakage, runaway cloud bills, and orphaned temporary files or compute tasks.
- **Detect:** Creating temporary cloud objects, presigned URLs with indefinite lifetimes, or cloud instances without automated deletion, lifecycle policies, or try/finally cleanup.
- **Evidence:** Missing expiration on signed URLs or temporary scratch blobs uploaded without lifecycle rules.
- **Avoid:**
  ```python
  # BAD: Generating presigned URL with excessive 7-day expiration for immediate one-time download
  url = s3.generate_presigned_url('get_object', Params={'Bucket': bucket, 'Key': key}, ExpiresIn=604800)
  ```
- **Remediation:**
  ```python
  # GOOD: Minimal expiration window (e.g., 15 minutes) and automated S3 lifecycle rules for temp buckets
  url = s3.generate_presigned_url('get_object', Params={'Bucket': bucket, 'Key': key}, ExpiresIn=900)
  ```
- **Severity:** Medium / High (Base Deduction: 2.0 to 4.0).

### CLD10: Infrastructure & Environment Parity
- **Purpose:** Prevent accidental production execution against development environments, test endpoints, or unencrypted storage configurations.
- **Detect:** Hardcoding staging/test endpoints in production code, or falling back silently to development configurations when production environment variables are missing.
- **Evidence:** `ENDPOINT = os.getenv("CLOUD_ENDPOINT", "http://localhost:4566")` in production deployment modules.
- **Avoid:**
  ```python
  # BAD: Silently falls back to local fake cloud in production if env var is missing
  bucket_name = os.getenv("PROD_BUCKET_NAME", "dev-test-bucket")
  ```
- **Remediation:**
  ```python
  # GOOD: Explicitly require configuration in production and fail fast if missing
  bucket_name = os.environ.get("PROD_BUCKET_NAME")
  if not bucket_name:
      raise ConfigurationError("PROD_BUCKET_NAME environment variable is required")
  ```
- **Severity:** High (Base Deduction: 4.0).

