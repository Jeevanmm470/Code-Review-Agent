// TC-002: Bug Fix Missing Regression Test (TST02)
package com.quality.demo;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class DiscountCalculatorTest {
    // TST02 Defect: PR fixed a bug where negative quantities caused overflow, but no regression test exercises negative quantity
    @Test
    public void testPositiveQuantityDiscount() {
        DiscountCalculator calc = new DiscountCalculator();
        assertEquals(10.0, calc.calculate(5));
    }
}

