// TC-008: Strict Enum Parser Crashing on Unrecognized Enum Value (BWC08)
using System;

namespace Compat.Validation;

public enum PaymentStatus
{
    Pending,
    Completed
    // Failed, Refunded added upstream
}

public class PaymentProcessor
{
    public PaymentStatus ParseStatus(string rawStatus)
    {
        // BWC08 Defect: Enum.Parse throws ArgumentException if upstream API returns a newly added enum value
        return (PaymentStatus)Enum.Parse(typeof(PaymentStatus), rawStatus, true);
    }
}

