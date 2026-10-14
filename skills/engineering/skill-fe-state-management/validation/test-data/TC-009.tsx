import React, { useState } from 'react';

// TC-009: FSM09 - State Mutation & Change Detection Safety
export function TagManager({ initialTags }: { initialTags: string[] }) {
  const [tags, setTags] = useState<string[]>(initialTags);

  const addTag = (newTag: string) => {
    // VIOLATION (FSM09): In-place mutation of state array breaks shallow equality / change detection
    tags.push(newTag);
    setTags(tags); // React sees identical array reference and skips re-render
  };

  return (
    <div>
      <button onClick={() => addTag('new-tag')}>Add Tag</button>
      <ul>{tags.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  );
}

