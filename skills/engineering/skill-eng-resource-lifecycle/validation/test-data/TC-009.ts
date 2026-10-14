// TC-009: Unregistered Timer Callback Preventing Garbage Collection (RES09)
export class RealtimeStatusTracker {
  private timerHandle: any;
  private isDestroyed: boolean = false;

  constructor(private eventBus: any) {
    // RES09 Defect: Starts recurring interval timer and subscribes to event bus without cleanup method
    this.timerHandle = setInterval(() => {
      this.pollUpdates();
    }, 1000);

    this.eventBus.on("status_change", (data: any) => {
      this.handleEvent(data);
    });
  }

  // Defect: Missing destroy() / dispose() method to clearInterval and remove listener
  private pollUpdates() {
    // polling logic
  }

  private handleEvent(data: any) {
    // handler logic
  }
}

