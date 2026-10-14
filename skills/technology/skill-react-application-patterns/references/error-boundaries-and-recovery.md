# Error Boundaries & Recovery Reference

This guide details error boundary isolation strategies, render-phase vs. async error propagation mechanics, and user recovery fallbacks (`RAP05`, `RAP06`).

---

## 1. Error Boundary Granularity & Fallbacks (`RAP05`)

### 1.1 Granular Isolation vs. Monolithic Boundaries

A single root-level Error Boundary causes an entire dashboard or application to disappear into a blank error screen when a single non-critical widget throws an error during rendering. Independent UI widgets (charts, sidebars, feeds) should each have their own localized Error Boundary.

```tsx
// ❌ Monolithic: Any error in StockTicker or ChatWidget breaks the whole Dashboard
export function Dashboard() {
  return (
    <div className="layout">
      <Header />
      <StockTicker />
      <MainFeed />
      <ChatWidget />
    </div>
  );
}

// ✅ Granular: Individual widgets fail independently with retry fallbacks
import { ErrorBoundary } from 'react-error-boundary';

function WidgetFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div role="alert" className="widget-error">
      <p>Widget failed to load.</p>
      <button onClick={resetErrorBoundary}>Retry</button>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="layout">
      <Header />
      <ErrorBoundary FallbackComponent={WidgetFallback}>
        <StockTicker />
      </ErrorBoundary>
      <ErrorBoundary FallbackComponent={WidgetFallback}>
        <MainFeed />
      </ErrorBoundary>
      <ErrorBoundary FallbackComponent={WidgetFallback}>
        <ChatWidget />
      </ErrorBoundary>
    </div>
  );
}
```

---

## 2. Async & Event Handler Error Boundary Propagation (`RAP06`)

### 2.1 The React Error Boundary Limitation

React Error Boundaries (`componentDidCatch` and `getDerivedStateFromError`) **only** catch errors thrown during:
- The React render phase
- React lifecycle methods (e.g. `componentDidMount`, `componentDidUpdate`)
- Constructors of child components

They do **NOT** catch errors in:
- Event handlers (e.g. `onClick`, `onSubmit`)
- Asynchronous code (e.g. `setTimeout`, `requestAnimationFrame`)
- Unhandled Promise rejections inside async functions

#### Anti-Pattern: Expecting ErrorBoundary to Catch Async Errors
```tsx
// ❌ Bug: Error thrown inside async onClick is NOT caught by ErrorBoundary!
function OrderButton({ orderId }: { orderId: string }) {
  const handleClick = async () => {
    // When submitOrder fails, this throws unhandled promise rejection;
    // ErrorBoundary above will NOT activate, and user gets no feedback!
    const response = await submitOrder(orderId);
    if (!response.ok) {
      throw new Error(`Order failed with status ${response.status}`);
    }
  };

  return <button onClick={handleClick}>Submit Order</button>;
}
```

#### Correct Pattern 1: Local Error State
```tsx
// ✅ Correct: Handle async error locally with state and accessible alert
function OrderButton({ orderId }: { orderId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await submitOrder(orderId);
      if (!response.ok) {
        throw new Error('Order could not be processed.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Order'}
      </button>
      {error && <div role="alert" className="error-message">{error}</div>}
    </div>
  );
}
```

#### Correct Pattern 2: Bridging Async Errors to Error Boundary
When delegating async errors to an enclosing Error Boundary is intended, use `useErrorBoundary` hook from `react-error-boundary` or re-throw inside a state updater:

```tsx
// ✅ Correct: Using showBoundary hook from react-error-boundary
import { useErrorBoundary } from 'react-error-boundary';

function OrderButton({ orderId }: { orderId: string }) {
  const { showBoundary } = useErrorBoundary();

  const handleClick = async () => {
    try {
      const response = await submitOrder(orderId);
      if (!response.ok) throw new Error('Order rejected');
    } catch (err) {
      // Bridges async error directly to the nearest ErrorBoundary
      showBoundary(err);
    }
  };

  return <button onClick={handleClick}>Submit Order</button>;
}
```

