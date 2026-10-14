// TC-008: Shared Mutable Credential State in Singleton Adapter (ADP08)
package com.review.adapter;

import org.springframework.stereotype.Component;

@Component
public class GitHubAdapter {
    // ADP08 Defect: Mutable instance field storing tenant token on a Spring singleton
    private String currentTenantToken;

    public void setTenantToken(String token) {
        this.currentTenantToken = token;
    }

    public String fetchPullRequest(String repo, int id) {
        // High risk of race condition and cross-tenant credential leakage
        return "Calling GitHub with " + this.currentTenantToken;
    }
}

