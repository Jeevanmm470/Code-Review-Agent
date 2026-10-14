import React, { useState } from 'react';

interface SearchInputProps {
  value?: string;
  onChange?: (v: string) => void;
}

// Violation: Unsynchronized hybrid state ignoring parent value changes
export function ControlledStateMismatchViolation({ value, onChange }: SearchInputProps) {
  // Violation: State initialized once from prop, ignoring future updates to value prop
  const [internalText, setInternalText] = useState(value || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalText(e.target.value);
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return <input value={internalText} onChange={handleChange} />;
}

// Safe Counterpart: Fully controlled component relying on props
export function SafeControlledPropsPattern({ value = '', onChange }: SearchInputProps) {
  return (
    <input
      value={value}
      onChange={(e) => {
        if (onChange) {
          onChange(e.target.value);
        }
      }}
    />
  );
}

