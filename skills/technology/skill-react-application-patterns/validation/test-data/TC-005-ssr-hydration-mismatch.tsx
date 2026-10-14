import React, { useState, useEffect } from 'react';

// ❌ Flawed: Immediate browser API access during render causes SSR hydration mismatch
export function FlawedResponsiveNavbar() {
  // On server, window is undefined (or default 1024), on client mobile window.innerWidth < 768 is true
  // Render output mismatches during hydration, causing React hydration mismatch error
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  return (
    <nav className="navbar">
      {isMobile ? (
        <button aria-label="Open mobile menu" className="hamburger-btn">
          ☰
        </button>
      ) : (
        <ul className="desktop-menu">
          <li>Home</li>
          <li>Features</li>
          <li>Pricing</li>
        </ul>
      )}
    </nav>
  );
}

// ✅ Safe: Defers client-only window access to useEffect or CSS media queries
export function SafeResponsiveNavbar() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <nav className="navbar">
      <div className={isMobile ? 'mobile-visible' : 'desktop-visible'}>
        {isMobile ? (
          <button aria-label="Open mobile menu" className="hamburger-btn">
            ☰
          </button>
        ) : (
          <ul className="desktop-menu">
            <li>Home</li>
            <li>Features</li>
            <li>Pricing</li>
          </ul>
        )}
      </div>
    </nav>
  );
}

