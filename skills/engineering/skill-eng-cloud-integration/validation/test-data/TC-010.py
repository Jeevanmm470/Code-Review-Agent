# TC-010: Silent fallback to local dev bucket in production code
import os
import boto3

def get_production_storage_bucket():
    # Defect CLD10: Falls back silently to local dev bucket name when env var is missing in production
    bucket_name = os.getenv("PROD_STORAGE_BUCKET", "local-dev-mock-bucket")
    return bucket_name

