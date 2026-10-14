import React, { useState } from 'react';

// TC-003: FSM03 - Async Race Conditions & Sequence Safety
export function SearchTypeahead({ searchApi }: { searchApi: (q: string) => Promise<string[]> }) {
  const [results, setResults] = useState<string[]>([]);

  // VIOLATION (FSM03): Out-of-order async responses overwrite newer query results
  const onInputChange = async (query: string) => {
    const data = await searchApi(query);
    setResults(data);
  };

  return (
    <div>
      <input onChange={(e) => onInputChange(e.target.value)} />
      <ul>{results.map((r, i) => <li key={i}>{r}</li>)}</ul>
    </div>
  );
}

