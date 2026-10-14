// TC-011: Clean Production Routing Implementation (CLEAN)
// Fully compliant routing with proper precedence, encoded params, auth guards, outlets, fallbacks, and cancellation.
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet, useParams, useNavigate, useSearchParams } from 'react-router-dom';

export function CleanApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="users/new" element={<CreateUserPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function RootLayout() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function HomePage() { return <h1>Home</h1>; }
function CreateUserPage() { return <h1>New User</h1>; }
function NotFoundPage() { return <h1>Page Not Found</h1>; }

function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/users/${encodeURIComponent(id || '')}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      });

    return () => controller.abort();
  }, [id]);

  if (!user) return <div>Loading...</div>;
  return <h1>User: {user.name}</h1>;
}

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const handleSearchChange = (val: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (val) next.set('q', val);
        else next.delete('q');
        return next;
      },
      { replace: true }
    );
  };

  return <input value={q} onChange={(e) => handleSearchChange(e.target.value)} />;
}

