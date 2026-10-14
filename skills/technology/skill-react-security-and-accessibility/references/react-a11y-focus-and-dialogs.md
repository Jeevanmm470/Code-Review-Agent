# React Accessibility: Focus Management & Dialogs Reference

## 1. Overview & Mechanics

Modal dialogs, popovers, navigation drawers, and floating panels require explicit keyboard focus management in React applications:
1. **Focus Trapping / Containment**: When a modal is open, keyboard `Tab` navigation must be contained within the modal dialog so users cannot tab behind the overlay into background elements.
2. **Initial Focus**: When the modal opens, focus should be moved into the dialog (e.g. to the first interactive field or close button).
3. **Focus Restoration**: When the modal closes, focus must be returned to the element that originally triggered its opening.
4. **Escape Key Dismissal**: Pressing the `Escape` key must close the dialog.

---

## 2. Detailed Review Rules

### RSA-FOCUS-001: Modal Focus Containment & Restoration (`RSA08`)

- **Defect**: Rendering a custom React modal or overlay without trapping focus, without listening to `Escape` key events, or without restoring focus to the trigger button upon unmounting.
- **Consequence**: Keyboard users tab into background content while the modal is open, or lose their focus position on the page when closing the modal (causing focus to jump to `<body>`).
- **Detection Pattern**:
  ```tsx
  // BAD: Custom modal lacking focus management and Escape handling
  function SimpleModal({ isOpen, onClose, children }: ModalProps) {
    if (!isOpen) return null;
    return (
      <div className="modal-backdrop">
        <div className="modal-body">
          {children}
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }
  ```
- **Remediation**:
  ```tsx
  // GOOD: Implement focus management or use Radix Dialog / native <dialog>
  import { useEffect, useRef } from 'react';

  function AccessibleModal({ isOpen, onClose, title, children }: ModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (isOpen) {
        previousFocusRef.current = document.activeElement as HTMLElement;
        dialogRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
          window.removeEventListener('keydown', handleKeyDown);
          previousFocusRef.current?.focus(); // Restore focus on close
        };
      }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
      <div className="modal-backdrop" role="presentation">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className="modal-body"
        >
          <h2>{title}</h2>
          {children}
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }
  ```

---

## 3. False-Positive Safeguards

1. **Native `<dialog>` Element**: If the component uses the HTML5 `<dialog>` element and calls `.showModal()`, native browser focus trapping and Escape handling are provided automatically.
2. **Accessible Primitive Libraries**: When using `@radix-ui/react-dialog`, `@headlessui/react`, or `react-aria`, focus management and restoration are built-in. Do not flag custom wrappers around these libraries.

