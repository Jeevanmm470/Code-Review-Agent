import React, { useState } from 'react';

// TC-001: FSM01 - State Ownership & Duplication Prevention
export function UserProfileHeader({ user }: { user: { id: string; name: string; role: string } }) {
  // VIOLATION (FSM01): Copying prop into local state without syncing; ignores parent user updates
  const [userName, setUserName] = useState(user.name);

  return (
    <div className="header">
      <h2>User: {userName}</h2>
      <span>Role: {user.role}</span>
    </div>
  );
}

