import React from 'react';

// TC-002: FSEC02 - Dangerous URL Schemes & Client Open Redirects
export function UserWebsiteLink({ targetUrl }: { targetUrl: string }) {
  // VIOLATION (FSEC02): Dynamic link destination without protocol whitelist allowing javascript:... pseudo-protocol
  return (
    <div className="link-container">
      <a href={targetUrl} target="_blank">
        Visit User Website
      </a>
    </div>
  );
}

