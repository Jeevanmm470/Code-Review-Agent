// Violation: Parses JSON response from fetch without checking response.ok for 4xx/5xx HTTP errors
async function IgnoredFetchStatusViolation(url) {
  const response = await fetch(url);
  return await response.json();
}

// Safe Counterpart: Verifies response.ok prior to processing response payload
async function SafeFetchStatusHandling(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP Error Status: ${response.status}`);
  }
  return await response.json();
}

