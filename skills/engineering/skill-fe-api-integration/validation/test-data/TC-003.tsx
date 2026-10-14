import React, { useState } from 'react';

export const Autocomplete = () => {
  const [results, setResults] = useState([]);

  const onType = async (text: string) => {
    // Defect FAI03: Async request without cancellation or sequence token allows race condition overwrites
    const res = await fetch(`/api/suggestions?query=${encodeURIComponent(text)}`);
    const data = await res.json();
    setResults(data);
  };

  return <input onChange={(e) => onType(e.target.value)} />;
};

