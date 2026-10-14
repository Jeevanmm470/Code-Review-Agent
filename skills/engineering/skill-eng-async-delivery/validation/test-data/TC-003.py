# TC-003: Immediate tight retry loop on consumer failure without exponential backoff
import time

def process_message_with_retry(msg, downstream_service):
    attempts = 0
    while attempts < 10:
        try:
            return downstream_service.send(msg)
        except Exception as e:
            # Defect ASY03: Tight retry loop without exponential backoff or jitter
            attempts += 1
            continue
    raise RuntimeError("Failed after retries")

