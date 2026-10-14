import React, { useState } from 'react';

// BAD: Nested component definition inside parent function body
// Destroys component identity on every parent re-render, resetting local state and recreating DOM.
export function InlineComponentRemountViolation() {
  const [count, setCount] = useState(0);

  function NestedProfileInput() {
    const [text, setText] = useState('');
    return <input value={text} onChange={(e) => setText(e.target.value)} />;
  }

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
      <NestedProfileInput />
    </div>
  );
}

// Top-level extracted component maintains stable identity
function ExtractedProfileInput() {
  const [text, setText] = useState('');
  return <input value={text} onChange={(e) => setText(e.target.value)} />;
}

// GOOD: Stable top-level component reference preserves state and prevents remounting
export function SafeExtractedComponentPattern() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
      <ExtractedProfileInput />
    </div>
  );
}

