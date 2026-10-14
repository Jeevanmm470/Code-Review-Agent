import React, { useEffect, useState } from 'react';

// TC-005: FSEC05 - Client-Side Only Authorization & False Boundaries
export function TenantUserDirectory({ currentTenantId }: { currentTenantId: string }) {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // VIOLATION (FSEC05): Fetching all multi-tenant users and filtering client-side
    fetch('/api/admin/all-system-users')
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((u: any) => u.tenantId === currentTenantId);
        setUsers(filtered);
      });
  }, [currentTenantId]);

  return (
    <div>
      {users.map((u) => (
        <div key={u.id}>{u.email} - {u.role}</div>
      ))}
    </div>
  );
}

