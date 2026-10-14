// TC-008: Cross-tenant resource mutation using unverified payload parameters
package com.example.webhooks;

import org.springframework.web.bind.annotation.*;

@RestController
public class SubscriptionWebhookHandler {

    private final SubscriptionService subscriptionService;

    public SubscriptionWebhookHandler(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping("/webhooks/subscription")
    public void handleSubscriptionWebhook(@RequestBody WebhookPayload payload) {
        // Defect EVT08: Uses payload.getTenantId() or payload.getSubscriptionId() directly without validating 
        // that the webhook endpoint secret matches the target tenantId/resource ownership
        subscriptionService.cancelSubscription(payload.getTenantId(), payload.getSubscriptionId());
    }
}

