# React Accessibility: Semantic JSX & Accessible Naming Reference

## 1. Overview & Mechanics

Assistive technologies (screen readers, speech input, switch devices) rely on semantic HTML elements and programmatic accessible names:
1. **Interactive Semantics**: Native elements like `<button>`, `<a>`, `<input>` provide built-in focusability, keyboard triggers (Enter/Space), and screen reader roles out of the box.
2. **Accessible Name Computation**: Controls without visible text (e.g. icon-only close buttons, search icons) require `aria-label` or `aria-labelledby`.
3. **Form Control Association**: Form inputs require programmatic linkage with their labels using `<label htmlFor={id}>` or the React 18 `useId()` hook.

---

## 2. Detailed Review Rules

### RSA-A11Y-001: Click Handlers on Non-Interactive JSX Elements (`RSA06`)

- **Defect**: Attaching `onClick` handlers to `<div>`, `<span>`, or `<i>` elements without converting them to `<button>` or providing `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers.
- **Consequence**: Keyboard users (Tab key) cannot reach or activate the control, and screen reader users hear only static text or silence.
- **Detection Pattern**:
  ```tsx
  // BAD: Div clickable with no keyboard accessibility
  function DeleteRowButton({ onDelete }: { onDelete: () => void }) {
    return (
      <div className="delete-btn" onClick={onDelete}>
        <TrashIcon />
      </div>
    );
  }
  ```
- **Remediation**:
  ```tsx
  // GOOD: Use native button element with accessible label
  function DeleteRowButton({ onDelete }: { onDelete: () => void }) {
    return (
      <button
        type="button"
        className="delete-btn"
        aria-label="Delete item"
        onClick={onDelete}
      >
        <TrashIcon aria-hidden="true" />
      </button>
    );
  }
  ```

---

### RSA-A11Y-002: Missing Accessible Names on Icon-Only Controls (`RSA07`)

- **Defect**: Rendering interactive `<button>` or `<a>` elements containing only an SVG, icon font, or image without text content or `aria-label`.
- **Consequence**: Screen readers announce the element as "button" or "unlabeled button", leaving users unable to determine its action.
- **Detection Pattern**:
  ```tsx
  // BAD: Icon-only button without label
  <button type="button" onClick={onClose}>
    <CloseIcon />
  </button>
  ```
- **Remediation**:
  ```tsx
  // GOOD: Programmatic name provided via aria-label
  <button type="button" aria-label="Close dialog" onClick={onClose}>
    <CloseIcon aria-hidden="true" />
  </button>
  ```

---

### RSA-A11Y-003: Form Label Linkage with `useId` (`RSA07`)

- **Defect**: Rendering `<label>Email</label>` and `<input type="email" />` without connecting them via `htmlFor` and `id`, or hardcoding non-unique string IDs across reusable component instances.
- **Consequence**: Clicking the label fails to focus the input; screen readers fail to announce the label when tabbing into the input.
- **Remediation**: Use React 18's `useId()` hook to guarantee globally unique and SSR-consistent IDs.
  ```tsx
  // GOOD: Connected label and input using useId
  function FormInputField({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
    const inputId = useId();

    return (
      <div className="field-group">
        <label htmlFor={inputId}>{label}</label>
        <input id={inputId} {...props} />
      </div>
    );
  }
  ```

---

## 3. False-Positive Safeguards

1. **Buttons with Visible Text**: `<button onClick={submit}><SaveIcon /> Save</button>` already has the accessible name "Save" from its child text and does NOT require an extra `aria-label`.
2. **Hidden Decorative Icons**: Using `<svg aria-hidden="true">` inside a button with visible text is correct and should not be flagged.
3. **Headless Component Libraries**: Headless UI or Radix primitive components (`<Dialog.Close />`, `<DropdownMenu.Item />`) provide accessible names internally or accept props that are mapped automatically.

