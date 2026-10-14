# React Accessibility: Forms & Live Regions Reference

## 1. Overview & Mechanics

Dynamic form validation and asynchronous UI updates must be communicated effectively to assistive technologies:
1. **Form Validation Feedback**: Error messages must be programmatically linked to their corresponding input via `aria-describedby` and marked with `aria-invalid="true"`.
2. **Live Announcements**: Asynchronous operations (background saves, toasts, search result counts) that update without moving focus should be announced using `aria-live="polite"` or `role="status"`.

---

## 2. Detailed Review Rules

### RSA-FORM-001: Form Error Association & Accessible Validation (`RSA10`)

- **Defect**: Displaying dynamic error text below an input without linking it via `aria-describedby` or failing to set `aria-invalid="true"`.
- **Consequence**: Screen reader users navigate to the invalid field, are prompted for input without knowing why the previous entry failed or that an error exists.
- **Detection Pattern**:
  ```tsx
  // BAD: Error message rendered without programmatic linkage
  function UserEmailInput({ error, ...props }: InputProps) {
    return (
      <div>
        <label>Email Address</label>
        <input type="email" {...props} />
        {error && <span className="error-text">{error}</span>}
      </div>
    );
  }
  ```
- **Remediation**:
  ```tsx
  // GOOD: Linked using useId, aria-describedby, and aria-invalid
  import { useId } from 'react';

  function UserEmailInput({ error, ...props }: InputProps) {
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
          {...props}
        />
        {error && (
          <span id={errorId} className="error-text" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
  ```

---

### RSA-FORM-002: Dynamic Status Announcements via Live Regions (`RSA09`)

- **Defect**: Injecting dynamic toast notifications, loading states, or search result totals without `role="status"`, `role="alert"`, or `aria-live="polite"`.
- **Consequence**: Screen reader users receive no feedback when an asynchronous action finishes in the background.
- **Remediation**: Use `aria-live="polite"` for non-critical status changes and `role="alert"` for time-sensitive errors.
  ```tsx
  // GOOD: Polite live region for async results count
  <div aria-live="polite" aria-atomic="true" className="sr-only">
    {isLoading ? 'Searching products...' : `${results.length} products found.`}
  </div>
  ```

---

## 3. False-Positive Safeguards

1. **Static Validation Messages**: Helper text or format hints statically rendered above the form don't require `role="alert"`.
2. **Modal Error Dialogs**: If an error opens a modal dialog that traps focus, an `aria-live` region is unnecessary because focus is already directed into the dialog.

