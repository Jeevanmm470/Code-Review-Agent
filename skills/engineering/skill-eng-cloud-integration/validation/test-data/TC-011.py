# TC-011: Safe, compliant cloud integration service with IAM authentication, timeouts, paginator, and streaming
import os
import boto3
from botocore.config import Config

# Safe CLD01, CLD02, CLD03, CLD04, CLD05, CLD07:
# 1. Configured client with timeouts and standard retry mode
s3_config = Config(
    connect_timeout=3,
    read_timeout=10,
    retries={"max_attempts": 3, "mode": "standard"}
)

# 2. Reusable singleton client utilizing default IAM credential chain
s3_client = boto3.client("s3", config=s3_config)

def process_all_files(bucket_name, destination_folder):
    # 3. Paginator handles pagination tokens safely
    paginator = s3_client.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket_name):
        for obj in page.get("Contents", []):
            key = obj["Key"]
            dest_path = os.path.join(destination_folder, os.path.basename(key))
            
            # 4. Stream directly to file on disk without buffering in RAM
            with open(dest_path, "wb") as f:
                s3_client.download_fileobj(bucket_name, key, f)

