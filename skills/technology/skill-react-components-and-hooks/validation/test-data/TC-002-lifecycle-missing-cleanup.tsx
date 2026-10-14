import React, { useState, useEffect } from 'react';

// Violation: Missing event listener cleanup on component unmount
export function MissingEffectCleanupViolation() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Violation: Window scroll listener added without cleanup teardown
    window.addEventListener('scroll', handleScroll);
  }, []);

  return <div>Scroll Position: {scrollY}px</div>;
}

// Safe Counterpart: Explicitly removes event listener in cleanup return function
export function SafeEffectCleanupPattern() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return <div>Scroll Position: {scrollY}px</div>;
}

