# TC-010: Consumer test suite lacking idempotency duplicate delivery assertions
import pytest

def test_consumer_happy_path(mock_db, order_consumer):
    # Defect ASY10: Only tests single happy-path delivery without testing duplicate redelivery idempotency
    msg = {"id": "evt-123", "order_id": 456, "action": "fulfill"}
    order_consumer.handle(msg)
    assert mock_db.get_status(456) == "fulfilled"

