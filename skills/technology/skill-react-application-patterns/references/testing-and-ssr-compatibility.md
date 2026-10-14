# Testing, SSR Hydration & Version Compatibility Reference

This guide details best practices for asynchronous React Testing Library (RTL) queries, server-side rendering (SSR) hydration mismatch prevention, and React 18 / 19 ecosystem compatibility (`RAP08`, `RAP09`, `RAP10`).

---

## 1. React Testing Library Async Synchronization (`RAP08`)

### 1.1 The Synchronous Assertion Flake

When an action triggers an asynchronous state update (e.g. data fetch, timeout, form submit), using synchronous `getBy*` or `queryBy*` queries immediately after dispatching the action causes flaky tests or immediate test failures.

#### Anti-Pattern: Synchronous Query or Arbitrary Sleep
```tsx
// ❌ Flaky & Anti-Pattern: Using synchronous getBy or arbitrary sleep
test('loads user profile', async () => {
  render(<UserProfile userId="123" />);

  // Flake: Element is not rendered yet!
  // expect(screen.getByText('Alice')).toBeInTheDocument(); // Fails!

  // Anti-Pattern: Arbitrary sleep timer slows down test suite and remains flaky
  await new Promise((r) => setTimeout(r, 1000));
  expect(screen.getByText('Alice')).toBeInTheDocument();
});
```

#### Correct Pattern: `findBy*` or `waitFor`
```tsx
// ✅ Correct: findBy automatically waits up to 1000ms with interval polling
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('loads user profile', async () => {
  render(<UserProfile userId="123" />);

  // Automatically retries until element appears or timeout occurs
  const userName = await screen.findByRole('heading', { name: /alice/i });
  expect(userName).toBeInTheDocument();
});

test('submits form asynchronously', async () => {
  const user = userEvent.setup();
  render(<FeedbackForm />);

  await user.type(screen.getByRole('textbox', { name: /comment/i }), 'Great work!');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(screen.getByRole('status')).toHaveTextContent(/thank you/i);
  });
});
```

---

## 2. SSR Hydration Consistency & Browser APIs (`RAP09`)

### 2.1 Hydration Mismatch Causes

During React Server-Side Rendering (SSR) (e.g. Next.js, Remix), React renders HTML on the server and attaches event listeners on the client (hydration). If the initial HTML generated on the client differs from what the server returned, React emits hydration warnings and can destroy client-side DOM state.

#### Common Causes:
1. Accessing `window`, `document`, or `localStorage` directly in render body.
2. Rendering locale-specific timestamps or dates formatted differently on server vs browser.
3. Using `Math.random()` or non-deterministic IDs in render.

#### Anti-Pattern: Immediate Client API Read in Render
```tsx
// ❌ Bug: Server renders "Desktop" (window is undefined), client with width 500 renders "Mobile", causing hydration mismatch!
function ResponsiveHeader() {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  return (
    <header>
      {isMobile ? <MobileNav /> : <DesktopNav />}
    </header>
  );
}
```

#### Correct Pattern: Deferring Client-Specific Render with `useEffect`
```tsx
// ✅ Correct: Guarantees identical initial render on server and client; updates post-mount
import { useState, useEffect } from 'react';

function ResponsiveHeader() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Set actual value on client
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header>
      {/* Alternatively, use CSS media queries (display: none / block) for pure styling */}
      <div className={isMobile ? 'mobile-visible' : 'desktop-visible'}>
        {isMobile ? <MobileNav /> : <DesktopNav />}
      </div>
    </header>
  );
}
```

---

## 3. React 18 vs React 19 Version Compatibility (`RAP10`)

### 3.1 Ref as Prop vs. `forwardRef`
- **React 18**: Function components cannot accept `ref` directly; must be wrapped in `React.forwardRef((props, ref) => ...)`.
- **React 19**: Function components accept `ref` directly as a standard prop (`function MyInput({ ref, ...props })`). `forwardRef` is deprecated and will be removed in future versions.

### 3.2 Form Actions & Transitions
- **React 18**: Form actions and mutations are typically managed with React Hook Form, Formik, or `useTransition` / `useState`.
- **React 19**: Native support for `<form action={...}>`, `useActionState`, and `useFormStatus` hooks for declarative pending states and optimistic updates.

