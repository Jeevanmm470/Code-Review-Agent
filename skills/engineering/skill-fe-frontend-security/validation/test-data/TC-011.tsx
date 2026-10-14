import React from 'react';
import DOMPurify from 'dompurify';

// TC-011: Compliant Frontend Security Reference Implementation

export function SafeUserProfile({ bioHtml, websiteUrl }: { bioHtml: string; websiteUrl: string }) {
  // Safe HTML sanitization using DOMPurify
  const cleanBio = DOMPurify.sanitize(bioHtml, { USE_PROFILES: { html: true } });

  // Safe URL protocol validation preventing javascript: pseudo-protocols
  const isSafeUrl = /^https?:\/\//i.test(websiteUrl);

  return (
    <div className="profile-card">
      <div dangerouslySetInnerHTML={{ __html: cleanBio }} />
      {isSafeUrl ? (
        <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
          Official Website
        </a>
      ) : (
        <span>Invalid website URL</span>
      )}
    </div>
  );
}

export function setupSecurePostMessageBridge(
  trustedOrigin: string,
  handler: (data: unknown) => void
) {
  const listener = (event: MessageEvent) => {
    // Strict origin verification
    if (event.origin !== trustedOrigin) {
      return;
    }
    handler(event.data);
  };

  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}

