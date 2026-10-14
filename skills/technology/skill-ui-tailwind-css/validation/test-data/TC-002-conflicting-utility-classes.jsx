// Tailwind CSS Conflicting Utility Classes Test Fixtures (TW01, TW06)

import { twMerge } from "tailwind-merge";

// Violation: Unvarianted conflicting padding and text alignment utilities on the same element
export function ConflictingUtilityViolation({ isActive }) {
  const extraClasses = isActive ? "p-4 text-center" : "p-2 text-left";
  // Results in "p-2 text-left p-4 text-center" without twMerge, leading to non-deterministic CSS overrides
  return <div className={`p-2 text-left ${extraClasses}`}>Conflicting utilities</div>;
}

// Safe Counterpart: Resolving conflicting utility classes via tailwind-merge
export function SafeTailwindMergeUsage({ isActive }) {
  const extraClasses = isActive ? "p-4 text-center" : "p-2 text-left";
  const className = twMerge("p-2 text-left", extraClasses);
  return <div className={className}>Merged utilities</div>;
}

