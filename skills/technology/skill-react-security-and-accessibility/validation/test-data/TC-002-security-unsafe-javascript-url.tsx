import React from 'react';

// BAD: Unvalidated user URL rendered directly in href, allowing javascript: scheme execution
export function UnsafeJavascriptUrlViolation({ destinationUrl }: { destinationUrl: string }) {
  return (
    <div>
      <a href={destinationUrl} target="_blank" rel="noopener noreferrer">
        Click to navigate
      </a>
    </div>
  );
}

function isSafeProtocol(url: string): boolean {
  try {
    const parsed = new URL(url, 'https://example.com');
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// GOOD: URL scheme validated against safe protocols before rendering
export function SafeValidatedUrlPattern({ destinationUrl }: { destinationUrl: string }) {
  const safeHref = isSafeProtocol(destinationUrl) ? destinationUrl : '#';

  return (
    <div>
      <a href={safeHref} target="_blank" rel="noopener noreferrer">
        Click to navigate
      </a>
    </div>
  );
}

