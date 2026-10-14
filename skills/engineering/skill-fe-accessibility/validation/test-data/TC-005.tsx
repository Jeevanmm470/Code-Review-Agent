import React, { useState } from 'react';

export const Accordion = () => {
  const [open, setOpen] = useState(false);

  // Defect FA11Y05: Expandable control fails to expose dynamic aria-expanded state or aria-controls
  return (
    <div>
      <button onClick={() => setOpen(!open)}>Toggle Details</button>
      {open && <div id="details">Detailed info content</div>}
    </div>
  );
};

