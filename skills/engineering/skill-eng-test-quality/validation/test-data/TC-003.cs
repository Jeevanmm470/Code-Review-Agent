// TC-003: Unverified Exception Test Body (TST03)
using System;
using Xunit;

namespace Quality.Validation;

public class PaymentServiceTests
{
    [Fact]
    public void TestInvalidPaymentThrows()
    {
        var service = new PaymentService();
        // TST03 Defect: Expects exception without asserting error code, message, or ensuring no charge was processed
        Assert.Throws<ArgumentException>(() => service.Charge(-50));
    }
}

