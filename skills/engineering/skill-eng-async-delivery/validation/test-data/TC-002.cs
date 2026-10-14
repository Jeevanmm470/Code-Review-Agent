// TC-002: Non-idempotent credit mutation on queue redelivery without deduplication key
using System;
using System.Threading.Tasks;

public class UserCreditConsumer
{
    private readonly ICreditService _creditService;

    public UserCreditConsumer(ICreditService creditService)
    {
        _creditService = creditService;
    }

    public async Task HandleAsync(AddCreditMessage message)
    {
        // Defect ASY02: Applies non-idempotent credit increment directly without deduplication check
        await _creditService.AddCreditsAsync(message.UserId, message.Amount);
    }
}

