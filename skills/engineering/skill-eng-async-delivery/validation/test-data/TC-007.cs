// TC-007: BackgroundService ignoring cancellation token and abruptly killing in-flight tasks
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;

public class DataSyncWorker : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // Defect ASY07: Fires and forgets without passing stoppingToken or awaiting in-flight sync task
            _ = Task.Run(() => PerformLongSyncOperation());
            await Task.Delay(5000);
        }
    }

    private void PerformLongSyncOperation() {}
}

