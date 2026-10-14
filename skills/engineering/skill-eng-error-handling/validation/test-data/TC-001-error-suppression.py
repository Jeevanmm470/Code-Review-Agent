# TC-001: Error and Exception Suppression
import logging

logger = logging.getLogger(__name__)

def process_payment(order_id: str, amount: float):
    try:
        payment_gateway.charge(order_id, amount)
    except PaymentError:
        pass  # VIOLATION (ERR01): Silent suppression masks failed payment as successful
    return {"status": "SUCCESS", "order_id": order_id}

