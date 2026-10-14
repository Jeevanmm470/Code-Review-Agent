// TC-010: Route Fallbacks & 404 Error Boundaries Defect (FRN10)
// Complete router definition lacking catch-all 404 route and error boundaries.
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export function RouterConfig() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        {/* Defect: No wildcard 404 fallback route (<Route path="*" ... />) */}
      </Routes>
    </BrowserRouter>
  );
}

function HomePage() { return <h1>Home</h1>; }
function AboutPage() { return <h1>About</h1>; }
function ContactPage() { return <h1>Contact</h1>; }

