// TC-004: Query Parameters & Search Params Handling Defect (FRN04)
// Updating page number parameter inadvertently blows away existing filters in search params.
import React from 'react';
import { useSearchParams } from 'react-router-dom';

export function PaginationControl() {
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (newPage: number) => {
    // Defect: Overwriting searchParams completely, dropping active filter, sort, and query params
    setSearchParams({ page: newPage.toString() });
  };

  return (
    <div>
      <button onClick={() => handlePageChange(2)}>Page 2</button>
    </div>
  );
}

