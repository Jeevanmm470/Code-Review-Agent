import React from 'react';

// Defect FA11Y10: Infinite animation without prefers-reduced-motion media query and undersized touch target
export const PulsingBadge = () => {
  return (
    <button
      style={{
        width: 14,
        height: 14,
        padding: 0,
        animation: 'pulse 1s infinite',
      }}
      aria-label="Alerts"
    />
  );
};

