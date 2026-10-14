// TC-007: FSEC07 - Unsafe Browser Messaging & Cross-Origin postMessage

export function setupIframeBridge(callback: (token: string) => void) {
  // VIOLATION (FSEC07): Missing origin verification in postMessage event listener
  window.addEventListener('message', (event) => {
    // Missing: if (event.origin !== 'https://trusted-auth.example.com') return;
    if (event.data && event.data.type === 'AUTH_TOKEN_RESPONSE') {
      callback(event.data.token);
    }
  });
}

