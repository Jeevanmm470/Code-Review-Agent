import React from 'react';

export const IconButton = ({ onClick }: { onClick: () => void }) => {
  // Defect FA11Y02: Icon-only button lacks accessible name (no aria-label, aria-labelledby, or sr-only text)
  return (
    <button type="button" onClick={onClick}>
      <svg viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
    </button>
  );
};

