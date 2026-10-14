import React, { useEffect, useState } from 'react';

export const UserDetail = ({ id }: { id: string }) => {
  const [user, setUser] = useState(null);

  // Defect FAI08: Missing AbortController cleanup in useEffect leaks memory on unmount
  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, [id]);

  return <div>{user ? JSON.stringify(user) : 'Loading...'}</div>;
};

