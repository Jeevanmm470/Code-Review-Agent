// TC-006: Removing Field from Published Event Schema (BWC06)
export interface OrderCreatedEventV1 {
  eventId: string;
  orderId: string;
  customerId: string;
}

export class OrderEventPublisher {
  publishOrderCreated(eventBus: any, order: any) {
    // BWC06 Defect: Omitted customerId from event payload, breaking decoupled subscribers expecting customerId
    const payload = {
      eventId: order.id,
      orderId: order.orderNumber,
    };
    eventBus.emit("order.created", payload);
  }
}

