"""TC-010: High-Risk Financial Calculation With Single Trivial Test Case (TST10)."""

class TaxCalculationEngine:
    def calculate_tier_tax(self, income: float, country: str, dependents: int) -> float:
        # Complex multi-tier tax brackets with deductions
        if country == "US":
            if income > 100000:
                return (income - 100000) * 0.30 + 15000 - (dependents * 1000)
            return income * 0.15
        return income * 0.20

def test_tax_calculation_trivial_only():
    # TST10 Defect: Critical tax engine tested with only one trivial happy-path case, leaving 90% of logic and edge cases untested
    engine = TaxCalculationEngine()
    assert engine.calculate_tier_tax(50000, "CA", 0) == 10000.0

