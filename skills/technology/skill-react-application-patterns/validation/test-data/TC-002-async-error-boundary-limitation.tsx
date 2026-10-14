import React, { useState } from 'react';

declare function cancelSubscriptionApi(id: string): Promise<{ ok: boolean; status: number }>;

// ❌ Flawed: Expecting enclosing ErrorBoundary to catch async unhandled error
export function FlawedSubscriptionCancelButton({ subscriptionId }: { subscriptionId: string }) {
  const handleCancel = async () => {
    // Unhandled promise rejection: React Error Boundaries do NOT catch async errors!
    const response = await cancelSubscriptionApi(subscriptionId);
    if (!response.ok) {
      throw new Error(`Failed to cancel subscription with status ${response.status}`);
    }
  };

  return (
    <button onClick={handleCancel}>
      Cancel Subscription
    </button>
  );
}

// ✅ Safe: Handles async error locally with state and accessible error alert
export function SafeSubscriptionCancelButton({ subscriptionId }: { subscriptionId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await cancelSubscriptionApi(subscriptionId);
      if (!response.ok) {
        throw new Error('Unable to cancel subscription. Please try again later.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleCancel} disabled={loading} aria-busy={loading}>
        {loading ? 'Cancelling...' : 'Cancel Subscription'}
      </button>
      {error && (
        <div role="alert" className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}

