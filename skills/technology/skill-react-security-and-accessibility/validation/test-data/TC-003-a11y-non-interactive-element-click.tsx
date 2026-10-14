import React from 'react';

// BAD: Attaching onClick to a div without role, tabIndex, or keyboard handler
export function NonInteractiveElementClickViolation({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="card-item" onClick={onSelect}>
      <h3>Select Option</h3>
      <p>Card description text</p>
    </div>
  );
}

// GOOD: Using native button element with accessible keyboard interaction
export function SafeSemanticButtonPattern({ onSelect }: { onSelect: () => void }) {
  return (
    <button type="button" className="card-item-button" onClick={onSelect}>
      <h3>Select Option</h3>
      <p>Card description text</p>
    </button>
  );
}

