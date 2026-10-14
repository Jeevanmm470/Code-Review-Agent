// TC-006: FSEC06 - Cross-Origin Request Safety & Client CSRF Misconfiguration

export async function submitEmailChange(newEmail: string) {
  // VIOLATION (FSEC06): State-changing mutation relying on cookies without CSRF header or token
  return fetch('/api/user/change-email', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      // Missing anti-CSRF token header (e.g. X-CSRF-Token)
    },
    body: JSON.stringify({ email: newEmail }),
  });
}

