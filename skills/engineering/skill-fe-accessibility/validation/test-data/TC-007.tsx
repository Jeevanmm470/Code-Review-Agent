import React from 'react';

// Defect FA11Y07: System status conveyed exclusively by a colored circle without accompanying text or aria-label
export const OnlineStatusBadge = ({ isOnline }: { isOnline: boolean }) => {
  return (
    <div className="status-indicator">
      <span style={{ backgroundColor: isOnline ? '#22c55e' : '#ef4444', width: 10, height: 10, borderRadius: '50%', display: 'inline-block' }} />
    </div>
  );
};

