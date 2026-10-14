import React, { useState, useTransition } from 'react';

interface Item {
  id: number;
  text: string;
}

const ALL_ITEMS: Item[] = Array.from({ length: 5000 }, (_, i) => ({
  id: i,
  text: `Item record index ${i}`,
}));

// BAD: Updating both text input and heavy filtered list synchronously blocks user typing
export function BlockingTransitionSearchViolation() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(ALL_ITEMS);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    // Blocking synchronous update of large filtered dataset
    setResults(ALL_ITEMS.filter((item) => item.text.includes(val)));
  };

  return (
    <div>
      <input value={query} onChange={handleSearch} placeholder="Search..." />
      <ul>
        {results.slice(0, 50).map((r) => (
          <li key={r.id}>{r.text}</li>
        ))}
      </ul>
    </div>
  );
}

// GOOD: Wraps heavy secondary filtering in startTransition to keep text input responsive
export function SafeNonBlockingTransitionPattern() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(ALL_ITEMS);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val); // Urgent state update
    startTransition(() => {
      // Non-urgent interruptible transition
      setResults(ALL_ITEMS.filter((item) => item.text.includes(val)));
    });
  };

  return (
    <div>
      <input value={query} onChange={handleSearch} placeholder="Search..." />
      {isPending && <div>Filtering results...</div>}
      <ul>
        {results.slice(0, 50).map((r) => (
          <li key={r.id}>{r.text}</li>
        ))}
      </ul>
    </div>
  );
}

