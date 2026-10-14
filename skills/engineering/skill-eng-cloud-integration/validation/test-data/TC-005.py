# TC-005: Cloud pagination ignored resulting in silent data truncation
import boto3

def get_all_bucket_keys(bucket_name):
    s3 = boto3.client("s3")
    # Defect CLD05: list_objects_v2 only returns first 1000 items; NextContinuationToken is ignored
    response = s3.list_objects_v2(Bucket=bucket_name)
    return [obj["Key"] for obj in response.get("Contents", [])]

