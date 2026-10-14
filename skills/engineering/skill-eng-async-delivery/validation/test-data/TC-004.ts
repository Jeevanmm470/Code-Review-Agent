// TC-004: Uncaught JSON parse crash blocking queue partition without DLQ
import { SQSHandler } from 'aws-lambda';

export const handler: SQSHandler = async (event) => {
    for (const record of event.Records) {
        // Defect ASY04: Corrupt body causes unhandled JSON parse crash, triggering infinite redelivery loops without DLQ
        const payload = JSON.parse(record.body);
        await processOrder(payload);
    }
};

async function processOrder(payload: any) {}

