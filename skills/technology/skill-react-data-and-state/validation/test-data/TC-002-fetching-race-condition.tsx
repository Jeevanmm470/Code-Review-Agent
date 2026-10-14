import React, { useState, useEffect } from 'react';

// BAD: Async fetch inside useEffect without cleanup or AbortController
// If `userId` changes rapidly, responses may arrive out of order, overwriting newer data with stale data.
export function AsyncRaceConditionViolation({ userId }: { userId: string }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  return <div>User: {user?.name}</div>;
}

// GOOD: Async fetch using AbortController and active flag to prevent out-of-order state updates
export function SafeAbortControllerPattern({ userId }: { userId: string }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true;

    setLoading(true);
    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (isCurrent) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError' && isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  return <div>User: {user?.name}</div>;
}

