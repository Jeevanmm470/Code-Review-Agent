# Routing & Navigation Reference

This guide provides deep technical patterns, anti-patterns, and remediation for React Router (v6/v7) and Next.js (App & Pages Router) navigation, routing hierarchies, parameter handling, and protected redirect flows (`RAP01`, `RAP02`).

---

## 1. Route Hierarchy & Configuration (`RAP01`)

### 1.1 React Router Nested Layouts and `<Outlet />`

In React Router v6+, parent route elements must render `<Outlet />` to display child route components. If `<Outlet />` is omitted, child routes will match URL paths successfully but render nothing.

#### Anti-Pattern: Missing Layout Outlet
```tsx
// ❌ Bug: Child routes under /dashboard will never render because Outlet is missing
import { Routes, Route } from 'react-router-dom';

function DashboardLayout() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <Header />
      {/* Missing <Outlet /> here! */}
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route path="analytics" element={<AnalyticsView />} />
        <Route path="settings" element={<SettingsView />} />
      </Route>
    </Routes>
  );
}
```

#### Correct Pattern: Explicit `<Outlet />` Placement
```tsx
// ✅ Correct: Outlet renders matched child component
import { Outlet } from 'react-router-dom';

function DashboardLayout() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <Header />
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}
```

### 1.2 Route Parameter Validation & Parsing

Route parameters returned from `useParams()` are strings or `undefined`. Accessing them without validation can lead to runtime exceptions or unexpected behavior in data-fetching hooks.

```tsx
// ❌ Fragile: Direct usage of unvalidated route param
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  // If URL is /users/abc, parseInt returns NaN, causing invalid API requests
  const id = parseInt(userId!, 10);
  const { data } = useQuery(['user', id], () => fetchUser(id));
  return <div>{data?.name}</div>;
}

// ✅ Correct: Validate route params with fallback or error state
function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const id = Number(userId);

  if (!userId || Number.isNaN(id) || id <= 0) {
    return <NotFoundMessage message="Invalid user identifier in URL" />;
  }

  return <UserDetails userId={id} />;
}
```

---

## 2. Protected Routes & Redirect Synchronization (`RAP02`)

### 2.1 Redirect Loops and Navigation State Preservation

When implementing authentication guards or protected routes, components must record the target location so users can be redirected back post-login without getting stuck in infinite redirect loops.

#### Anti-Pattern: Unchecked Redirect & State Loss
```tsx
// ❌ Flawed: Drops previous location and can loop if login page itself uses guard
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login'); // Loses where user was trying to go!
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return <Spinner />;
  return isAuthenticated ? <>{children}</> : null;
}
```

#### Correct Pattern: Declarative `<Navigate />` with Location State
```tsx
// ✅ Correct: Uses Navigate with replace and passes location in state
import { Navigate, useLocation } from 'react-router-dom';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner aria-label="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    // Preserve intended destination in location.state.from
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// On the Login page:
export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // Safe default fallback
  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';

  const handleLoginSuccess = () => {
    navigate(from, { replace: true });
  };
  // ...
}
```

### 2.2 Unvalidated External Redirect URLs

When reading redirect targets from query parameters (e.g. `?returnUrl=...`), open redirect vulnerabilities occur if the URL protocol or origin is not validated before navigating.

```tsx
// ❌ Unsafe: Direct window navigation to untrusted query parameter
const [searchParams] = useSearchParams();
const returnUrl = searchParams.get('returnUrl');
if (returnUrl) {
  window.location.href = returnUrl; // Allows returnUrl=https://evil-phishing.com
}

// ✅ Safe: Validate relative path or same-origin
function isSafeRedirectUrl(url: string | null): boolean {
  if (!url) return false;
  // Ensure relative path starting with / and not protocol-relative //
  return url.startsWith('/') && !url.startsWith('//');
}

const safeTarget = isSafeRedirectUrl(returnUrl) ? returnUrl! : '/dashboard';
navigate(safeTarget, { replace: true });
```

