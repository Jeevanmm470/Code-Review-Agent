import React from 'react';

// Defect FA11Y08: Informative chart image missing alt attribute completely
export const RevenueReport = () => {
  return (
    <div className="report-card">
      <h2>Q3 Financial Summary</h2>
      <img src="/charts/revenue-breakdown-2026.png" />
    </div>
  );
};

