// TC-007: Out-of-order state mutations without sequence or version checks
using System;
using System.Threading.Tasks;

public class OrderEventConsumer
{
    private readonly IOrderRepository _repository;

    public OrderEventConsumer(IOrderRepository repository)
    {
        _repository = repository;
    }

    public async Task HandleOrderUpdated(OrderUpdatedEvent evt)
    {
        // Defect EVT07: Blindly mutates order status without checking evt.Version or evt.Timestamp against entity
        var order = await _repository.GetByIdAsync(evt.OrderId);
        order.Status = evt.NewStatus;
        await _repository.SaveAsync(order);
    }
}

