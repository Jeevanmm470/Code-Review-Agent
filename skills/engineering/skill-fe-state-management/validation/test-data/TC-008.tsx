import React, { useState, useEffect } from 'react';

// TC-008: FSM08 - Lifecycle Subscriptions & Stale Closures
export function AutoRefreshCounter({ eventEmitter }: { eventEmitter: any }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // VIOLATION (FSM08): Missing unsubscribe cleanup and stale closure capturing count
    eventEmitter.on('tick', () => {
      setCount(count + 1); // Stale closure over initial count
    });
    // Missing: return () => eventEmitter.off('tick', ...);
  }, []);

  return <div>Count: {count}</div>;
}

