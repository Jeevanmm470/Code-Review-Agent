import React, { useState } from 'react';
import TextField from '@mui/material/TextField';

// VIOLATION: Passing undefined as value to controlled TextField causes React warning & value drift
export function UncontrolledValueDriftViolation({ initialUserData }) {
  const [name, setName] = useState(initialUserData?.name); // initialUserData.name can be undefined

  return (
    <TextField
      label="User Name"
      value={name} // undefined when missing initialUserData.name
      onChange={(e) => setName(e.target.value)}
    />
  );
}

// SAFE: Fallback to empty string ensures input remains consistently controlled
export function SafeControlledInputHandling({ initialUserData }) {
  const [name, setName] = useState(initialUserData?.name ?? '');

  return (
    <TextField
      label="User Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );
}

