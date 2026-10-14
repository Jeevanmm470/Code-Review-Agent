// TC-003: Destructive Rethrow and Loss of Context
using System;
using Microsoft.Extensions.Logging;

namespace Example.Services
{
    public class OrderProcessor
    {
        private readonly ILogger<OrderProcessor> _logger;

        public OrderProcessor(ILogger<OrderProcessor> logger) => _logger = logger;

        public void ProcessOrder(string orderId)
        {
            try
            {
                ExecuteOrderPipeline(orderId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed order processing");
                throw ex; // VIOLATION (ERR03): throw ex resets original stack trace
            }
        }

        private void ExecuteOrderPipeline(string id) => throw new InvalidOperationException("Pipeline error");
    }
}

