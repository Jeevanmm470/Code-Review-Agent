# TC-009: Excessive presigned URL expiration window on sensitive export files
import boto3

def generate_export_download_link(s3_client, bucket, key):
    # Defect CLD09: Generating presigned URL with 30-day expiration window for temporary report download
    return s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=2592000  # 30 days in seconds
    )

