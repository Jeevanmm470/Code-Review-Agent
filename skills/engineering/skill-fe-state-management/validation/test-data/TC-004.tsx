import React, { useState } from 'react';

// TC-004: FSM04 - State Transitions & Invariant Integrity
export function AsyncDataView({ fetchFn }: { fetchFn: () => Promise<string[]> }) {
  // VIOLATION (FSM04): Independent booleans allow impossible states (loading && error simultaneously)
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<string[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    // Missing: setIsError(false)
    try {
      const res = await fetchFn();
      setData(res);
    } catch {
      setIsError(true);
    }
  };

  return (
    <div>
      <button onClick={loadData}>Reload</button>
      {isLoading && <div>Loading...</div>}
      {isError && <div className="error">Failed to load</div>}
      <ul>{data.map((d, i) => <li key={i}>{d}</li>)}</ul>
    </div>
  );
}

