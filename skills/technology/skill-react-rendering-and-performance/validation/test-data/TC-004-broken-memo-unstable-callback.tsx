import React, { useState, useCallback } from 'react';

interface ChildProps {
  label: string;
  onClick: () => void;
}

const MemoizedChildButton = React.memo(function ChildButton({ label, onClick }: ChildProps) {
  return <button onClick={onClick}>{label}</button>;
});

// BAD: Memoized child is passed a newly created inline arrow function on every parent render
// Defeats React.memo shallow prop comparison, forcing child re-renders.
export function BrokenMemoUnstableCallbackViolation() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <MemoizedChildButton
        label="Action Button"
        onClick={() => console.log('Action Clicked')} // New function instance every render!
      />
    </div>
  );
}

// GOOD: Callback is wrapped in useCallback preserving referential equality across parent renders
export function SafeStableCallbackPattern() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log('Action Clicked');
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <MemoizedChildButton
        label="Action Button"
        onClick={handleClick}
      />
    </div>
  );
}

