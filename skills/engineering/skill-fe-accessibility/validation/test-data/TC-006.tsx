import React from 'react';

export const FormInputWithError = ({ hasError, errorMsg }: { hasError: boolean; errorMsg: string }) => {
  // Defect FA11Y06: Form field validation error is not programmatically linked via aria-describedby or aria-invalid
  return (
    <div>
      <label>Email Address</label>
      <input type="email" className={hasError ? 'input-error' : ''} />
      {hasError && <span className="error-text">{errorMsg}</span>}
    </div>
  );
};

