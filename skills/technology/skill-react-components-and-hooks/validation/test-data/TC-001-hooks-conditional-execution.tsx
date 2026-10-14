import React, { useState, useEffect } from 'react';

// Violation: Calling useState and useEffect conditionally after an early return
export function ConditionalHooksViolation({ user }: { user?: { name: string } }) {
  if (!user) {
    return <div>No User Logged In</div>;
  }

  // Violation: Hook called conditionally after early return
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    console.log(`Theme is ${theme}`);
  }, [theme]);

  return <div>Welcome, {user.name} ({theme})</div>;
}

// Safe Counterpart: All hooks called unconditionally at top level
export function SafeTopLevelHooksPattern({ user }: { user?: { name: string } }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (user) {
      console.log(`Theme is ${theme}`);
    }
  }, [theme, user]);

  if (!user) {
    return <div>No User Logged In</div>;
  }

  return <div>Welcome, {user.name} ({theme})</div>;
}

