import React from 'react';

// TC-001: FSEC01 - Unsafe HTML Rendering & Dangerous DOM Sinks
export function UserProfileBio({ bioHtml }: { bioHtml: string }) {
  // VIOLATION (FSEC01): Direct rendering of raw HTML string without DOMPurify sanitization
  return (
    <div className="user-bio">
      <h3>User Bio</h3>
      <div dangerouslySetInnerHTML={{ __html: bioHtml }} />
    </div>
  );
}

