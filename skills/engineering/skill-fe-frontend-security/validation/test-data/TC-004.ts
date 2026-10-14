// TC-004: FSEC04 - Insecure Client Token Handling & Session State

export function downloadExportReport(reportId: string, accessToken: string) {
  // VIOLATION (FSEC04): Passing raw auth bearer token in URL query string, leaking via Referer / history
  const downloadUrl = `https://api.example.com/v1/reports/${reportId}/export?token=${accessToken}`;
  window.location.href = downloadUrl;
}

