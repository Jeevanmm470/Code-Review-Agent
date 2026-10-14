import React from 'react';
import DOMPurify from 'dompurify';

// BAD: Rendering unsanitized user markdown/HTML directly into dangerouslySetInnerHTML
export function UnsanitizedHtmlInjectionViolation({ userMarkdown }: { userMarkdown: string }) {
  return (
    <div className="markdown-preview">
      <h3>User Content</h3>
      <div dangerouslySetInnerHTML={{ __html: userMarkdown }} />
    </div>
  );
}

// GOOD: Sanitizing HTML using DOMPurify before passing to dangerouslySetInnerHTML
export function SafeSanitizedHtmlPattern({ userMarkdown }: { userMarkdown: string }) {
  const sanitized = DOMPurify.sanitize(userMarkdown);

  return (
    <div className="markdown-preview">
      <h3>User Content</h3>
      <div dangerouslySetInnerHTML={{ __html: sanitized }} />
    </div>
  );
}

