// TC-007: Disregarding Provider Retry-After Header on 429 (ADP07)
export async function fetchWithRetry(url: string, headers: Record<string, string>) {
  let attempts = 0;
  while (attempts < 3) {
    const res = await fetch(url, { headers });
    if (res.status === 429) {
      // ADP07 Defect: Hardcoded sleep ignoring provider standard Retry-After header
      await new Promise((r) => setTimeout(r, 1000));
      attempts++;
      continue;
    }
    return res.json();
  }
  throw new Error("Exhausted retries");
}

