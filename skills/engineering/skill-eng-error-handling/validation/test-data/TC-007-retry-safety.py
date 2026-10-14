# TC-007: Retry Safety and Termination
import time

class ChargeClient:
    def charge_customer(self, customer_id: str, amount: float):
        # VIOLATION (ERR07): Unbounded retry loop retrying permanent bad request without backoff or idempotency
        while True:
            try:
                payment_gateway.charge(customer_id, amount)
                break
            except InvalidAccountError:
                time.sleep(0.5)

