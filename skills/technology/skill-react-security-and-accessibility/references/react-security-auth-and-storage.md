# React Security: Auth Boundaries & Browser Storage Reference

## 1. Overview & Mechanics

Frontend applications operate entirely within the client environment (the user's browser), which is fully controllable and inspectable by the user or an attacker:
1. **Client-Side Authorization Fallacy**: Hiding a UI button or tab based on `user.role === 'admin'` does NOT secure the backend operation.
2. **Browser Storage Risks**: Data stored in `localStorage` or `sessionStorage` is vulnerable to extraction by any JavaScript executing in the same origin (including third-party scripts or XSS).
3. **Cross-Origin Messaging (`postMessage`)**: Listening to `window.addEventListener('message')` without validating `event.origin` allows any arbitrary website or iframe to send malicious payloads.

---

## 2. Detailed Review Rules

### RSA-AUTH-001: Client-Only Role Checks & False Boundaries (`RSA03`)

- **Defect**: Assuming that hiding UI controls or wrapping routes in client-side guards (`<AdminRoute>`) provides security enforcement without corresponding API authorization.
- **Consequence**: Privilege escalation if backend endpoints assume requests originating from authorized frontend flows are pre-validated.
- **Review Guidance**: Check if the client logic correctly treats UI guards as user-experience enhancements only, and verify that actions submit authorization tokens to protected backend endpoints.

---

### RSA-AUTH-002: Insecure Storage of Sensitive Credentials (`RSA04`)

- **Defect**: Storing private signing keys, long-lived refresh tokens, unhashed passwords, or PII in `localStorage` or bundling backend secrets (`SECRET_API_KEY`) into frontend React builds.
- **Consequence**: Credential exfiltration via XSS or browser extension access; exposure of backend master keys in public client bundles.
- **Remediation**:
  - Store session tokens in `HttpOnly`, `Secure`, `SameSite` cookies where possible.
  - Never prefix backend private secrets with `REACT_APP_` or `NEXT_PUBLIC_` or `VITE_`.

---

### RSA-AUTH-003: Unvalidated `postMessage` Origin (`RSA05`)

- **Defect**: Setting up a `window.addEventListener('message', (event) => { ... })` listener that acts on `event.data` without verifying `event.origin === TRUSTED_ORIGIN`.
- **Consequence**: Cross-origin message injection, allowing malicious iframes or parent windows to trigger unauthorized client actions.
- **Detection Pattern**:
  ```tsx
  // BAD: Missing origin check
  useEffect(() => {
    const handleMsg = (event: MessageEvent) => {
      if (event.data?.type === 'AUTH_SUCCESS') {
        setAuthToken(event.data.token);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);
  ```
- **Remediation**:
  ```tsx
  // GOOD: Strict origin verification
  useEffect(() => {
    const handleMsg = (event: MessageEvent) => {
      if (event.origin !== 'https://auth.example.com') return;
      if (event.data?.type === 'AUTH_SUCCESS') {
        setAuthToken(event.data.token);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);
  ```

---

## 3. False-Positive Safeguards

1. **Non-Sensitive UI Preferences**: Storing user theme preference (`localStorage.setItem('theme', 'dark')`) or collapsed sidebar states is safe and expected.
2. **Public API Keys**: Storing public keys intended for client-side consumption (e.g. Firebase API Key, Stripe Publishable Key, Google Maps Key) in environment variables is expected and NOT a secret leak.

