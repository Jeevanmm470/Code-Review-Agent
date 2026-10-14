# TypeScript React Contracts & Discriminated Unions Reference

This guide details best practices for typing React component props, structuring discriminated unions to eliminate invalid states, and avoiding unsafe type assertions (`RAP07`).

---

## 1. Discriminated Unions vs Conflicting Optional Props (`RAP07`)

### 1.1 The Multiple Optional Props Dilemma

When designing components that support multiple visual modes or variants (e.g. Alerts, Cards, Buttons), defining all variant-specific props as optional booleans/fields creates impossible state representations.

#### Anti-Pattern: Bag of Optional Props
```tsx
// ❌ Ambiguous & Error-Prone: Allows isSuccess=true AND isError=true simultaneously
interface AlertBannerProps {
  isSuccess?: boolean;
  isError?: boolean;
  isWarning?: boolean;
  errorMessage?: string;
  successData?: { orderId: string };
  warningMessage?: string;
}

export function AlertBanner(props: AlertBannerProps) {
  // If consumer passes <AlertBanner isSuccess isError errorMessage="Fail" successData={{orderId: '1'}} />
  // component has undefined behavior regarding which branch takes priority!
  if (props.isError) {
    return <div className="error">{props.errorMessage}</div>;
  }
  if (props.isSuccess) {
    return <div className="success">Order {props.successData?.orderId} confirmed</div>;
  }
  return null;
}
```

#### Correct Pattern: Strict Discriminated Union
```tsx
// ✅ Correct: Compiler guarantees mutually exclusive variants and required fields
type AlertBannerProps =
  | { variant: 'success'; orderId: string }
  | { variant: 'error'; errorMessage: string; retry?: () => void }
  | { variant: 'warning'; message: string };

export function AlertBanner(props: AlertBannerProps) {
  switch (props.variant) {
    case 'success':
      return <div className="success">Order {props.orderId} confirmed</div>;
    case 'error':
      return (
        <div className="error">
          <span>{props.errorMessage}</span>
          {props.retry && <button onClick={props.retry}>Retry</button>}
        </div>
      );
    case 'warning':
      return <div className="warning">{props.message}</div>;
  }
}
```

---

## 2. Event Handler and Prop Typing

### 2.1 Typing React Event Handlers

Avoid using `any` or `Function` for event callbacks. Use React's built-in parameterized event types (`React.MouseEvent<HTMLButtonElement>`, `React.ChangeEvent<HTMLInputElement>`).

```tsx
// ❌ Loose: Losing event target typing with generic Function / any
interface SearchInputProps {
  onChange: (e: any) => void;
  onSubmit: Function;
}

// ✅ Strong: Exact HTML element event typing
interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}
```

### 2.2 Unsafe Type Assertions (`as CustomType`)

Avoid casting unvalidated API or external prop data with `as Type` inside render trees. Use user-defined type guards or Zod schemas to ensure runtime safety.

```tsx
// ❌ Unsafe: Type casting bypasses runtime verification
function UserBadge({ rawPayload }: { rawPayload: unknown }) {
  const user = rawPayload as { name: string; avatarUrl: string };
  // If rawPayload is null or string, this throws TypeError: Cannot read properties of undefined
  return <div>{user.name.toUpperCase()}</div>;
}

// ✅ Safe: Runtime narrowing with type guard
interface User {
  name: string;
  avatarUrl: string;
}

function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'name' in obj && typeof (obj as User).name === 'string';
}

function UserBadge({ rawPayload }: { rawPayload: unknown }) {
  if (!isUser(rawPayload)) {
    return <span>Anonymous User</span>;
  }
  return <div>{rawPayload.name.toUpperCase()}</div>;
}
```

