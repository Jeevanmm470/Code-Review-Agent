import React, { useState } from 'react';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);

  const handleSearch = async (term: string) => {
    setQuery(term);
    // Defect FAI01: Raw string concatenation in URL without URI encoding breaks on special characters
    const response = await fetch(`/api/search?q=${term}&filter=active`);
    const data = await response.json();
    setResults(data.items);
  };

  return (
    <div>
      <input value={query} onChange={(e) => handleSearch(e.target.value)} />
      <ul>{results.map((r, i) => <li key={i}>{r}</li>)}</ul>
    </div>
  );
};

