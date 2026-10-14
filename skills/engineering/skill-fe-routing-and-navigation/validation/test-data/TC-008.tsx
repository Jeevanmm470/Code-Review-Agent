// TC-008: Nested Routes, Layouts & Outlet Boundaries Defect (FRN08)
// Admin layout declares child routes in configuration but forgets to render <Outlet /> in JSX.
import React from 'react';
import { Link } from 'react-router-dom';

export function AdminLayout() {
  return (
    <div className="admin-container">
      <nav>
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/settings">Settings</Link>
      </nav>
      <main>
        {/* Defect: Missing <Outlet /> component, child routes will not be rendered */}
        <h1>Admin Control Panel</h1>
      </main>
    </div>
  );
}

