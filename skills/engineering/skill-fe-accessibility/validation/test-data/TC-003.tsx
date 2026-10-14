import React, { useState } from 'react';

export const CustomTabs = ({ tabs }: { tabs: string[] }) => {
  const [selected, setSelected] = useState(0);

  // Defect FA11Y03: Custom tab widget lacks keyboard arrow navigation and aria-selected state
  return (
    <div className="tab-list">
      {tabs.map((tab, idx) => (
        <span key={idx} className={`tab ${selected === idx ? 'active' : ''}`} onClick={() => setSelected(idx)}>
          {tab}
        </span>
      ))}
    </div>
  );
};

