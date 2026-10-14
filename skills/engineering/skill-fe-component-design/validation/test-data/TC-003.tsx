import React, { useRef } from 'react';

// Defect FCD03: Parent reaches into child ref to mutate child private state directly
export const ParentContainer = () => {
  const childRef = useRef<any>(null);

  const handleReset = () => {
    // Violates component encapsulation by mutating child internal state directly
    childRef.current.internalValues.count = 0;
    childRef.current.forceUpdate();
  };

  return <button onClick={handleReset}>Reset Child</button>;
};

