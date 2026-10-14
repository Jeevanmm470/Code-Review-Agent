// TC-002: Navigation Targets & Dynamic Param Encoding Defect (FRN02)
// Raw unencoded string interpolation in navigation URLs allowing slashes/hashes to break routing.
import React from 'react';
import { useNavigate } from 'react-router-dom';

export function DocumentSearch() {
  const navigate = useNavigate();

  const handleSelectDoc = (docPath: string) => {
    // Defect: Unencoded parameter interpolation directly in URL path
    navigate(`/documents/${docPath}/view`);
  };

  return (
    <div>
      <button onClick={() => handleSelectDoc("folder/subfolder/file.pdf")}>
        Open Document
      </button>
    </div>
  );
}

