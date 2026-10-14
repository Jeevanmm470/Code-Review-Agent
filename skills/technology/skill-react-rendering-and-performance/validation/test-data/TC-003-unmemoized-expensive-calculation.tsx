import React, { useState, useMemo } from 'react';

interface MetricItem {
  id: string;
  score: number;
  category: string;
}

function heavyDataProcessing(items: MetricItem[], threshold: number): MetricItem[] {
  // Heavy computation simulating CPU-bound array transformations & sorting
  return items
    .filter((item) => item.score > threshold)
    .sort((a, b) => b.score - a.score);
}

// BAD: Heavy data processing runs synchronously on every render without useMemo
export function UnmemoizedExpensiveCalculationViolation({ items }: { items: MetricItem[] }) {
  const [threshold, setThreshold] = useState(50);
  const [toggle, setToggle] = useState(false);

  // Re-computed even when only `toggle` changes!
  const processed = heavyDataProcessing(items, threshold);

  return (
    <div>
      <button onClick={() => setToggle((t) => !t)}>Toggle: {String(toggle)}</button>
      <input type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
      <ul>
        {processed.map((item) => (
          <li key={item.id}>{item.score}</li>
        ))}
      </ul>
    </div>
  );
}

// GOOD: Calculation is cached using useMemo and only recalculates when items or threshold change
export function SafeMemoizedCalculationPattern({ items }: { items: MetricItem[] }) {
  const [threshold, setThreshold] = useState(50);
  const [toggle, setToggle] = useState(false);

  const processed = useMemo(() => {
    return heavyDataProcessing(items, threshold);
  }, [items, threshold]);

  return (
    <div>
      <button onClick={() => setToggle((t) => !t)}>Toggle: {String(toggle)}</button>
      <input type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
      <ul>
        {processed.map((item) => (
          <li key={item.id}>{item.score}</li>
        ))}
      </ul>
    </div>
  );
}

