# TC-001: Hardcoded AWS access key and secret in boto3 client initialization
import boto3

def get_s3_client():
    # Defect CLD01: Hardcoded AWS access key ID and secret key in source code
    return boto3.client(
        "s3",
        aws_access_key_id="AKIAIOSFODNN7EXAMPLE",
        aws_secret_access_key="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
        region_name="us-east-1"
    )

