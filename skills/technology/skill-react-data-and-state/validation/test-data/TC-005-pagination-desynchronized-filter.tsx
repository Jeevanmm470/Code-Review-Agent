import React, { useState } from 'react';

// BAD: Updating filter criteria without resetting page index to initial page (1 or 0)
// If the user is on page 10 and filters down to 2 results, they will view an empty page.
export function DesynchronizedPaginationViolation() {
  const [page, setPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('initial');

  const handleSearchChange = (term: string) => {
    // BUG: resets search term but leaves page at 5
    setSearchTerm(term);
  };

  return (
    <div>
      <input value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} />
      <div>Current Page: {page}</div>
      <button onClick={() => setPage((p) => p + 1)}>Next Page</button>
    </div>
  );
}

// GOOD: Changing search filter resets the active page to 1
export function SafeFilterPaginationResetPattern() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('initial');

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1); // Reset page on filter/search change
  };

  return (
    <div>
      <input value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} />
      <div>Current Page: {page}</div>
      <button onClick={() => setPage((p) => p + 1)}>Next Page</button>
    </div>
  );
}

