// TC-009: Message publisher strips active distributed traceparent context
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

export async function dispatchTask(sqsClient: SQSClient, queueUrl: string, taskData: any) {
    // Defect ASY09: Dispatches message without propagating distributed trace headers or correlation ID
    const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(taskData)
    });
    await sqsClient.send(command);
}

