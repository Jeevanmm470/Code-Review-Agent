import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface FilterProps {
  status: string;
  sortBy: string;
}

// BAD: useQuery key does not include all reactive dependencies (status, sortBy)
// When status or sortBy changes, cached data for the general 'items' key is returned, leading to stale display.
export function IncompleteQueryKeyViolation({ status, sortBy }: FilterProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => fetch(`/api/items?status=${status}&sortBy=${sortBy}`).then((res) => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  return (
    <ul>
      {data?.map((item: any) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}

// GOOD: Query key includes all relevant parameters ensuring proper cache segregation and automatic refetching on param change.
export function SafeCompleteQueryKeyPattern({ status, sortBy }: FilterProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['items', { status, sortBy }],
    queryFn: () => fetch(`/api/items?status=${status}&sortBy=${sortBy}`).then((res) => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  return (
    <ul>
      {data?.map((item: any) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}

