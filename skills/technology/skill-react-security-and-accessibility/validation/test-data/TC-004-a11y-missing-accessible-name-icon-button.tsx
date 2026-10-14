import React from 'react';

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

// BAD: Button contains only an SVG icon without visible text or aria-label
export function MissingAccessibleNameIconButtonViolation({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" onClick={onClose}>
      <CloseIcon />
    </button>
  );
}

// GOOD: Button provides accessible name via aria-label and hides decorative icon from assistive tech
export function SafeLabeledIconButtonPattern({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" aria-label="Close dialog" onClick={onClose}>
      <CloseIcon />
    </button>
  );
}

