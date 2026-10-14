import React from 'react';

// Defect FCD09: Untestable component with hardcoded window.location mutation and direct singleton API calls
export const UntestableAction = () => {
  const handleAction = () => {
    // Hidden unmockable global browser API manipulation
    window.location.href = 'https://external.com/checkout';
  };

  return <button onClick={handleAction}>Proceed</button>;
};

