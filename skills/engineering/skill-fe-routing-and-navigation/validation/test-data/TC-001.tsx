// TC-001: Route Definitions & Matching Precedence Defect (FRN01)
// Catch-all route shadows specific sub-routes and dynamic routes declared in top-to-bottom order.
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Defect: Wildcard route placed before specific static and dynamic routes */}
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/users/:id" element={<UserProfile />} />
        <Route path="/users/new" element={<CreateUser />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

function NotFoundPage() { return <div>Not Found</div>; }
function UserProfile() { return <div>User Profile</div>; }
function CreateUser() { return <div>Create User</div>; }
function Home() { return <div>Home</div>; }

