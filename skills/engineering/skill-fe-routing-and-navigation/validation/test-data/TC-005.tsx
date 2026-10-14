// TC-005: Browser History & Navigation Semantics Defect (FRN05)
// Executing history.push on every keystroke in search box, breaking browser back button.
import React from 'react';
import { useNavigate } from 'react-router-dom';

export function LiveSearchBar() {
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    // Defect: push navigation on every key stroke pollutes history stack and breaks back button
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return <input type="text" placeholder="Search..." onChange={handleInputChange} />;
}

