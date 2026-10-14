// TC-006: Re-instantiating Connection Pool / HTTP Client in Tight Loop (RES06)
using System.Net.Http;
using System.Threading.Tasks;

namespace Lifecycle.Validation;

public class MetricPusher
{
    public async Task PushMetrics(string[] endpoints, string payload)
    {
        foreach (var endpoint in endpoints)
        {
            // RES06 Defect: Instantiating HttpClient per iteration leads to TCP socket exhaustion (TIME_WAIT state)
            using (var client = new HttpClient())
            {
                var content = new StringContent(payload);
                await client.PostAsync(endpoint, content);
            }
        }
    }
}

