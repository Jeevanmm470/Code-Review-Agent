import { useState } from 'react';

export const PaginatedList = () => {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<any[]>([]);

  // Defect FAI07: Advancing page before response confirmation skips page indices on network failure
  const loadNext = async () => {
    setPage((prev) => prev + 1);
    const res = await fetch(`/api/items?page=${page + 1}`);
    const data = await res.json();
    setItems((prev) => [...prev, ...data.items]);
  };

  return <button onClick={loadNext}>Load More</button>;
};

