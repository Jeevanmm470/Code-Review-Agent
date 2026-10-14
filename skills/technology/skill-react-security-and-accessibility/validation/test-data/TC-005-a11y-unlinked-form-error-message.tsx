import React, { useId } from 'react';

// BAD: Input error is displayed visually but not programmatically linked via aria-describedby or aria-invalid
export function UnlinkedFormErrorMessageViolation({ error }: { error?: string }) {
  return (
    <div>
      <label>Email Address</label>
      <input type="email" />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

// GOOD: Label and input linked with useId, error linked via aria-describedby and aria-invalid
export function SafeLinkedFormErrorPattern({ error }: { error?: string }) {
  const inputId = useId();
  const errorId = useId();

  return (
    <div>
      <label htmlFor={inputId}>Email Address</label>
      <input
        id={inputId}
        type="email"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span id={errorId} className="error-text" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

