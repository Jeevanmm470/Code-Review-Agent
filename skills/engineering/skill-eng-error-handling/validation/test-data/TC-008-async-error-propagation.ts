// TC-008: Asynchronous and Concurrent Failure Propagation
export class NotificationManager {
    public sendWelcomeEmail(userId: string) {
        // VIOLATION (ERR08): Floating promise with unhandled rejection
        this.dispatchEmailAsync(userId);
    }

    private async dispatchEmailAsync(userId: string): Promise<void> {
        throw new Error("SMTP server unreachable");
    }
}

