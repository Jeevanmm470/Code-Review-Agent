# React Security: XSS & URL Navigation Reference

## 1. Overview & Mechanics

React automatically escapes string variables placed inside JSX expressions (e.g., `<div>{userInput}</div>`). However, several escape hatches and attribute sinks can bypass this protection:
1. **`dangerouslySetInnerHTML`**: Directly injects raw HTML into the DOM node, executing inline `<script>` tags, `<img onerror=...>`, or SVG event handlers if input contains unsanitized markup.
2. **`href` / `src` / Action Sinks**: Rendering user-controlled strings into `href`, `src`, or router navigation without protocol validation can execute `javascript:...` payloads.
3. **Open Redirects**: Passing unvalidated user input (query parameters, state values) into `window.location.href`, `useNavigate()`, or Next.js `router.push()` leading to phishing attacks.

---

## 2. Detailed Review Rules

### RSA-SEC-001: Unsanitized `dangerouslySetInnerHTML` (`RSA01`)

- **Defect**: Passing untrusted, user-supplied, markdown-rendered, or external API HTML directly into `dangerouslySetInnerHTML={{ __html: content }}` without HTML sanitization.
- **Consequence**: Stored or Reflected Cross-Site Scripting (XSS), enabling session hijacking, credential theft, and unauthorized actions.
- **Detection Pattern**:
  ```tsx
  // BAD: Rendering unsanitized HTML directly
  function CommentView({ rawComment }: { rawComment: string }) {
    return <div dangerouslySetInnerHTML={{ __html: rawComment }} />;
  }
  ```
- **Remediation**:
  ```tsx
  // GOOD: Sanitize with DOMPurify before injecting
  import DOMPurify from 'dompurify';

  function CommentView({ rawComment }: { rawComment: string }) {
    const cleanHtml = DOMPurify.sanitize(rawComment);
    return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
  }
  ```

---

### RSA-SEC-002: Executable URL Schemes & Navigation Targets (`RSA02`)

- **Defect**: Rendering untrusted URLs into `<a href={url}>` or calling `window.location = url` without validating that the protocol is safe (`http:`, `https:`, `mailto:`).
- **Consequence**: DOM-based XSS via `javascript:alert(document.cookie)` or data exfiltration via `data:text/html,...`.
- **Detection Pattern**:
  ```tsx
  // BAD: Direct rendering of user-provided link target
  function UserProfileLink({ websiteUrl }: { websiteUrl: string }) {
    return <a href={websiteUrl}>Visit Website</a>;
  }
  ```
- **Remediation**:
  ```tsx
  // GOOD: Validate URL scheme against allowed safe protocols
  function isSafeUrl(url: string): boolean {
    try {
      const parsed = new URL(url, window.location.origin);
      return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  function UserProfileLink({ websiteUrl }: { websiteUrl: string }) {
    const safeHref = isSafeUrl(websiteUrl) ? websiteUrl : '#';
    return (
      <a href={safeHref} rel="noopener noreferrer" target="_blank">
        Visit Website
      </a>
    );
  }
  ```

---

## 3. False-Positive Safeguards

1. **Hardcoded Static HTML**: Using `dangerouslySetInnerHTML={{ __html: '<strong>Static Text</strong>' }}` with hardcoded string constants does NOT present an XSS risk.
2. **DOMPurify Already Applied**: If the variable passed to `__html` is traced to a prior `DOMPurify.sanitize()` call, do NOT flag as an unsanitized sink.
3. **Relative Internal Links**: Relative URLs starting with `/` (e.g., `<Link to={`/users/${id}`}>`) cannot execute `javascript:` protocol payloads.

