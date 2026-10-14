import React, { useState, useEffect } from 'react';

// Violation: Uncancelled async fetch in useEffect prone to out-of-order race conditions
export function AsyncFetchRaceConditionViolation({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Violation: No AbortController, out-of-order responses overwrite state
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setProfile(data));
  }, [userId]);

  return <div>Profile: {profile ? profile.name : 'Loading...'}</div>;
}

// Safe Counterpart: Uses AbortController to cancel in-flight request when userId changes
export function SafeAbortControllerPattern({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });

    return () => {
      controller.abort();
    };
  }, [userId]);

  return <div>Profile: {profile ? profile.name : 'Loading...'}</div>;
}

