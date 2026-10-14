# TC-008: Cloud object key constructed directly from user input allowing path traversal
import boto3

def upload_user_attachment(s3_client, bucket, raw_filename, file_stream):
    # Defect CLD08: Concatenates un-sanitized user filename into S3 object key (path traversal / key overwrite)
    key = f"uploads/{raw_filename}"
    s3_client.upload_fileobj(file_stream, bucket, key)

