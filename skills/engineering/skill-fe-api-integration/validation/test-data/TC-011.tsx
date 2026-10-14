import React, { useEffect, useState } from 'react';

export const RobustUserSearch = ({ category }: { category: string }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const queryParams = new URLSearchParams({ cat: category });

    fetch(`/api/items?${queryParams.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.status === 204 ? null : res.json();
      })
      .then((items) => {
        if (items) setData(items);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [category]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <ul>{data.map((item, idx) => <li key={idx}>{item.name}</li>)}</ul>;
};

