"""
Test Case: TC-006
Rule: LPS06 - Bounded Retries & Polling Deadlines
Description: Unbounded polling loop lacking deadline, maximum attempts, or backoff.
"""

import time

def wait_for_job_completion(job_client, job_id):
    # VIOLATION (LPS06): Unbounded while True polling loop without max attempts, deadline, or backoff
    while True:
        status = job_client.get_status(job_id)
        if status == "COMPLETED":
            return job_client.get_result(job_id)
        if status == "FAILED":
            raise RuntimeError("Job failed")
        time.sleep(1)

