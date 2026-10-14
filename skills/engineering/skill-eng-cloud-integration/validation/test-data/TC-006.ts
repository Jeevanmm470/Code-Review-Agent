// TC-006: Immediate retry loop on cloud rate limits without backoff or jitter
import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";

export async function sendMetricsWithRetry(client: CloudWatchClient, data: any) {
    let attempts = 0;
    while (attempts < 5) {
        try {
            return await client.send(new PutMetricDataCommand(data));
        } catch (err: any) {
            // Defect CLD06: Immediate tight retry loop on throttling without backoff/jitter
            if (err.name === 'ThrottlingException' || err.$metadata?.httpStatusCode === 429) {
                attempts++;
            } else {
                throw err;
            }
        }
    }
}

