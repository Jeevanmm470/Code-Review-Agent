import React, { useState, useEffect, useMemo } from 'react';

// TC-011: Compliant State Management Reference Implementation

export function SafeSearchDashboard({ items, searchApi }: { items: Array<{ id: string; price: number }>; searchApi: (q: string, signal: AbortSignal) => Promise<string[]> }) {
  // 1. Derived computation calculated on render via useMemo
  const total = useMemo(() => items.reduce((acc, i) => acc + i.price, 0), [items]);

  // 2. Race-condition-free async search using AbortController
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!query) {
      setResults([]);
      setStatus('idle');
      return;
    }

    const controller = new AbortController();
    setStatus('loading');

    searchApi(query, controller.signal)
      .then((data) => {
        setResults(data);
        setStatus('success');
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setStatus('error');
        }
      });

    return () => controller.abort();
  }, [query, searchApi]);

  // 3. Immutable state update
  const [tags, setTags] = useState<string[]>([]);
  const handleAddTag = (tag: string) => {
    setTags((prev) => [...prev, tag]);
  };

  return (
    <div>
      <div>Total: ${total}</div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {status === 'loading' && <span>Searching...</span>}
      <ul>{results.map((r, i) => <li key={i}>{r}</li>)}</ul>
      <button onClick={() => handleAddTag('safe')}>Add Tag</button>
      <div>Tags: {tags.join(', ')}</div>
    </div>
  );
}

