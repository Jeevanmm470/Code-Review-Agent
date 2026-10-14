"""TC-001: Assertion-Free Smoke Test (TST01)."""

def test_process_orders():
    # TST01 Defect: Executes complex order logic with zero assertions, passing even if data is corrupted
    orders = [{"id": "1", "price": 100}, {"id": "2", "price": 200}]
    total = sum(o["price"] for o in orders)
    # Missing assert total == 300

