"""TC-011: Thorough, Deterministic, and Isolated Test Case (Passing Case)."""

import pytest

class TaxEngine:
    def calculate_tax(self, amount: float) -> float:
        if amount < 0:
            raise ValueError("Amount cannot be negative")
        return amount * 0.10

@pytest.mark.parametrize("amount,expected", [
    (0.0, 0.0),
    (100.0, 10.0),
    (500.0, 50.0),
])
def test_calculate_tax_valid(amount, expected):
    engine = TaxEngine()
    assert engine.calculate_tax(amount) == pytest.approx(expected)

def test_calculate_tax_negative_raises():
    engine = TaxEngine()
    with pytest.raises(ValueError, match="Amount cannot be negative"):
        engine.calculate_tax(-10.0)

