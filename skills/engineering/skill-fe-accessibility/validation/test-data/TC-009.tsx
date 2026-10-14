import React, { useState } from 'react';

export const SaveToast = () => {
  const [msg, setMsg] = useState('');

  // Defect FA11Y09: Dynamic status toast message lacking role="status" or aria-live="polite"
  const handleSave = () => {
    setMsg('Settings successfully updated');
  };

  return (
    <div>
      <button onClick={handleSave}>Save</button>
      {msg && <div className="toast-notification">{msg}</div>}
    </div>
  );
};

