import React from 'react';

export const InaccessibleButton = ({ onDelete }: { onDelete: () => void }) => {
  // Defect FA11Y01: Clickable div lacks keyboard focus, keyboard event listeners, and role="button"
  return (
    <div className="btn-delete" onClick={onDelete}>
      Delete Record
    </div>
  );
};

