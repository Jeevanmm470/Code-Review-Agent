// TC-010: Poison pill event crashes consumer or retries infinitely without DLQ
import { Message, Consumer } from 'sqs-consumer';

const app = Consumer.create({
    queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/my-queue',
    handleMessage: async (message: Message) => {
        // Defect EVT10: Parsing JSON throws exception on corrupt message, triggering infinite SQS retries
        // and blocking queue processing without sending to DLQ or acknowledging poison pill
        const data = JSON.parse(message.Body!);
        await processOrder(data);
    }
});

async function processOrder(data: any) {}

