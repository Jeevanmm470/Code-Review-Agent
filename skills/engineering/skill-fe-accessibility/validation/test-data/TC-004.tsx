import React from 'react';

// Defect FA11Y04: Inline CSS removing focus outline completely without providing a visible focus indicator
export const HiddenFocusButton = () => {
  return (
    <button style={{ outline: 'none', border: 'none' }} onClick={() => console.log('click')}>
      Submit
    </button>
  );
};

