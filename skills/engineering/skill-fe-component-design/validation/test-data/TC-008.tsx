import React, { useEffect } from 'react';

// Defect FCD08: Unrelated side effects (WebSocket, DOM scroll, and analytics) bundled into a single lifecycle hook
export const MultiEffectComponent = ({ userId }: { userId: string }) => {
  useEffect(() => {
    // Side effect 1: WebSocket
    const ws = new WebSocket('wss://example.com');
    // Side effect 2: Window scroll
    window.addEventListener('scroll', () => console.log('scroll'));
    // Side effect 3: Analytics telemetry
    navigator.sendBeacon('/analytics', userId);
  }, [userId]);

  return <div>Multi Effect</div>;
};

