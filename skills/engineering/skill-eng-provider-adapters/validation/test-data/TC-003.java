// TC-003: Silent Dummy Success on Unsupported Provider Capability (ADP03)
package com.review.adapter;

public class BitbucketServerAdapter implements CodeHostAdapter {
    @Override
    public boolean supportsInlineSuggestions() {
        return false; // Bitbucket Server lacks inline suggestion API
    }

    @Override
    public void submitInlineSuggestion(String prId, String comment, int line) {
        // ADP03 Defect: Silent no-op returning dummy success instead of throwing UnsupportedProviderCapabilityException
        System.out.println("Inline suggestions not supported, skipping silently");
    }
}

