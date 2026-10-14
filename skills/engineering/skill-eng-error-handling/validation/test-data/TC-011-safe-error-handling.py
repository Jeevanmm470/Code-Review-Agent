# TC-011: Safe Error Handling Patterns (Safe Negative Case)
import logging

logger = logging.getLogger(__name__)

class PaymentService:
    def execute_transaction(self, tx_id: str, amount: float):
        try:
            return gateway.charge(tx_id, amount, idempotency_key=f"tx-{tx_id}")
        except GatewayTimeoutError as exc:
            logger.warning("Gateway timeout for tx %s, scheduling retry: %s", tx_id, exc)
            raise TransientPaymentException("Payment temporarily unavailable") from exc
        except InvalidCardError as exc:
            logger.info("Declined card for tx %s: %s", tx_id, exc)
            raise ClientPaymentRejectedException("Invalid card details") from exc

