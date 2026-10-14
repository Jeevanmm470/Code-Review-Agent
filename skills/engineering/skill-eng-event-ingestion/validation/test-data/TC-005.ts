// TC-005: Synchronous long-running processing in webhook receiver handler
import { Request, Response } from 'express';
import { generateFinancialReports, syncCustomerDataToCrm } from './heavy-service';

export async function handleWebhook(req: Request, res: Response) {
    const event = req.body;
    
    // Defect EVT05: Heavy synchronous processing blocks HTTP response, causing provider timeouts
    await syncCustomerDataToCrm(event.customerId);
    const report = await generateFinancialReports(event.transactionId);
    
    // Response sent only after seconds of heavy synchronous work
    res.status(200).json({ status: 'done', reportId: report.id });
}

