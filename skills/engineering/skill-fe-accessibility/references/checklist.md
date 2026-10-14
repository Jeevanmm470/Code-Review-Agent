# Frontend Accessibility Inspection Checklist

This checklist defines review criteria, detection heuristics, evidence patterns, anti-patterns, remediation strategies, and default severities for rules `FA11Y01` through `FA11Y10`.

---

## FA11Y01: Semantic HTML & Interactive Controls

- **Purpose:** Ensure interactive elements use appropriate native semantic tags (`<button>`, `<a>`, `<input>`) or full ARIA widget roles, preventing inaccessible `div`/`span` buttons and invalid interactive element nesting.
- **Detect:**
  - Non-interactive elements (`<div>`, `<span>`, `<td>`, `<p>`) with `onClick` handlers lacking `tabIndex={0}`, `role="button"`, and keyboard handlers (`onKeyDown` for Enter/Space).
  - Nesting interactive elements inside other interactive elements (e.g. `<button><a href="...">Link</a></button>` or `<a href="..."><div><button>Edit</button></div></a>`).
  - Using `<a href="#">` or `<a href="javascript:void(0)">` for button actions that trigger JavaScript logic instead of navigation.
- **Evidence:**
  - `<div onClick={() => submitForm()} className="btn">Submit</div>` without keyboard or ARIA support.
  - Link tag wrapping a button tag, confusing screen reader navigation tree.
- **Avoid:**
  - Flagging standard semantic button/link implementations or container click handlers that merely implement event delegation for underlying native buttons.
- **Remediation:**
  - Replace clickable non-interactive containers with native `<button type="button">` or `<a href="...">`.
  - For links performing button actions, convert to `<button type="button">`.
- **Severity:** High

---

## FA11Y02: Accessible Names & Label Associations

- **Purpose:** Ensure all buttons, links, inputs, and interactive controls possess meaningful programmatic accessible names derived from text content, `aria-label`, or `aria-labelledby`.
- **Detect:**
  - Icon-only buttons (e.g. `<button><CloseIcon /></button>` or `<button><TrashIcon /></button>`) without `aria-label`, `aria-labelledby`, or visually hidden text.
  - Form inputs (`<input>`, `<select>`, `<textarea>`) missing associated `<label for="inputId">` or `aria-label`.
  - Links containing only icons or ambiguous generic text like `"Click here"`, `"Read more"`, or `"Learn more"` without context.
- **Evidence:**
  - `<button onClick={onClose}><XIcon /></button>` emitting an empty accessible name to screen readers.
  - `<input type="text" placeholder="Enter your email" />` relying solely on placeholder text without an associated label.
- **Avoid:**
  - Flagging buttons or links that contain visible text or `<span className="sr-only">Description</span>`.
- **Remediation:**
  - Add `aria-label="Close dialog"` or `aria-label="Delete item"` to icon-only controls.
  - Use explicit `<label htmlFor="email">Email</label>` wrapping or ID associations.
- **Severity:** High

---

## FA11Y03: Keyboard Navigation & Custom Widgets

- **Purpose:** Enforce full keyboard operability for custom widgets (tabs, dropdowns, menus, accordions) without creating keyboard traps or unreachable elements.
- **Detect:**
  - Custom dropdowns, tab strips, or listboxes that do not support Arrow key navigation or Enter/Space selection.
  - Interactive elements given `tabindex="-1"` without programmatic focus management, making them unreachable by keyboard.
  - Components creating keyboard traps where Tab focus becomes stuck and cannot cycle out.
  - Functionality triggered exclusively by mouse hover (`onMouseEnter`) without equivalent focus triggers (`onFocus`).
- **Evidence:**
  - Custom tab component where pressing Tab skips subsequent tabs instead of supporting Left/Right arrow keys and `aria-selected`.
  - Tooltip appearing on hover but inaccessible on keyboard focus.
- **Avoid:**
  - Flagging modal dialogs that intentionally contain Tab focus within the active modal boundary.
- **Remediation:**
  - Implement standard WAI-ARIA authoring practices (APG) for custom widgets (e.g. arrow keys for tabs/menus).
  - Pair `onMouseEnter`/`onMouseLeave` with `onFocus`/`onBlur` handlers.
- **Severity:** High

---

## FA11Y04: Focus Visibility & Dialog Management

- **Purpose:** Preserve clear visible focus indicators and ensure modal dialogs manage initial focus, trap focus while open, dismiss on Escape, and restore focus on close.
- **Detect:**
  - CSS removing focus outlines globally (`:focus { outline: none; }` or `outline: 0`) without providing an accessible alternative style.
  - Modal dialog components failing to trap keyboard focus within the dialog, allowing users to tab into background inert content.
  - Modal dialogs failing to return focus to the invoking trigger button upon closing.
  - Modal dialogs that cannot be dismissed by pressing the `Escape` key.
- **Evidence:**
  - Global CSS rule `* { outline: none !important; }` hiding keyboard focus indicator.
  - Modal component where pressing Tab escapes into background page DOM nodes behind the overlay.
- **Avoid:**
  - Flagging modern `:focus:not(:focus-visible) { outline: none; }` implementations that preserve keyboard focus indicators.
- **Remediation:**
  - Ensure custom focus rings meet a 3:1 contrast ratio against adjacent backgrounds.
  - Use HTML `<dialog>` with `.showModal()`, or standard headless libraries (Radix, React Aria, Headless UI) for focus trapping and restoration.
- **Severity:** High

---

## FA11Y05: ARIA Semantics, Roles & State Sync

- **Purpose:** Eliminate invalid ARIA roles, dangling ID references, and out-of-sync state attributes (`aria-expanded`, `aria-selected`, `aria-checked`).
- **Detect:**
  - Accordion triggers, dropdown toggles, or expandable menus failing to toggle `aria-expanded="true"|"false"` when opened/closed.
  - `aria-controls` or `aria-labelledby` referencing IDs that do not exist in the DOM.
  - Using invalid ARIA role names (e.g. `role="dropdown"`, `role="toggle"`) not recognized by the W3C ARIA specification.
  - Redundant roles on native elements (e.g. `<button role="button">` or `<nav role="navigation">`).
- **Evidence:**
  - `<button onClick={() => setOpen(!open)}>Menu</button>` without `aria-expanded={open}` or `aria-controls="menu-list"`.
  - `<div aria-labelledby="non-existent-header-id">` causing screen reader failure.
- **Avoid:**
  - Flagging valid ARIA attributes correctly synchronized with component state variables.
- **Remediation:**
  - Bind `aria-expanded`, `aria-selected`, and `aria-checked` directly to reactive component state.
  - Verify that ID references in `aria-labelledby` and `aria-describedby` resolve to valid element IDs.
- **Severity:** Medium

---

## FA11Y06: Form Labels, Validation & Error Links

- **Purpose:** Programmatically link form inputs with descriptive labels, required indicators (`aria-required`), and validation error messages via `aria-describedby`.
- **Detect:**
  - Form validation error messages rendered as plain text adjacent to an input without programmatic linkage (`aria-describedby="field-error-id"` or `aria-invalid="true"`).
  - Required fields indicated only by a visual red asterisk (`*`) without `required` or `aria-required="true"`.
  - Color-only validation indicators (e.g. turning input border red without an accompanying descriptive text message).
- **Evidence:**
  - Input with validation error: `<input id="email" className="border-red-500" /> <span className="error">Invalid email</span>` lacking `aria-invalid="true"` and `aria-describedby`.
- **Avoid:**
  - Flagging native HTML5 form validation controls that use browser-native error tooltips and required attributes.
- **Remediation:**
  - Add `aria-invalid={hasError}` and `aria-describedby={hasError ? "email-error" : undefined}` to the `<input>`.
  - Add `id="email-error"` to the error message container.
- **Severity:** High

---

## FA11Y07: Visual Contrast & Non-Color Cues

- **Purpose:** Ensure text and interactive controls meet minimum WCAG color contrast ratios and avoid conveying essential status exclusively through color.
- **Detect:**
  - Low-contrast text styles (e.g. light gray text `#999999` on white `#ffffff` background failing 4.5:1 WCAG AA minimum).
  - System status indicators (success, warning, error, active) conveyed solely by a colored circle without accompanying text, icon shape, or accessible label.
  - Active navigation links indicated only by text color change without font weight, underline, or `aria-current="page"`.
- **Evidence:**
  - Badge component rendering `<span className="bg-green-500 w-3 h-3 rounded-full"></span>` with no text or `aria-label="Online"`.
  - Text styled with `color: #a0a0a0; background-color: #ffffff;` (contrast ratio ~2.4:1).
- **Avoid:**
  - Flagging disabled controls or purely decorative elements that are explicitly exempt under WCAG 1.4.3.
- **Remediation:**
  - Adjust color tokens to satisfy 4.5:1 for normal text and 3:1 for large text / UI components.
  - Pair color indicators with icons, distinct shapes, and `aria-current` or `aria-label` descriptors.
- **Severity:** High

---

## FA11Y08: Images, Icons & Media Alternatives

- **Purpose:** Provide descriptive alternative text on informative images and correctly mark decorative or redundant icons as hidden from assistive technologies.
- **Detect:**
  - Informative `<img>` tags missing the `alt` attribute entirely (causes screen readers to announce the raw image URL/filename).
  - Meaningless generic alt text such as `alt="image"`, `alt="graphic"`, or `alt="photo"`.
  - Decorative icons or illustrations lacking `aria-hidden="true"` or `alt=""`, creating repetitive screen reader noise alongside visible text.
  - `<video>` or `<audio>` media elements missing `<track kind="captions">` for non-text audio content.
- **Evidence:**
  - `<img src="/charts/q3-revenue.png" />` with no `alt` attribute.
  - `<button><svg aria-hidden="false">...</svg> Delete</button>` announcing both the raw SVG and the "Delete" text.
- **Avoid:**
  - Flagging decorative images correctly marked with `alt=""` or `role="presentation"`.
- **Remediation:**
  - Add meaningful, context-specific `alt` descriptions to informative images.
  - Add `aria-hidden="true"` to decorative icons placed adjacent to visible text labels.
- **Severity:** High

---

## FA11Y09: Dynamic Content & Live Announcements

- **Purpose:** Ensure important asynchronous updates, status toasts, and dynamic error summaries are announced via `aria-live` regions without disruptive focus jumps.
- **Detect:**
  - Asynchronous form submission success/error messages appearing dynamically in the DOM without `role="status"`, `role="alert"`, or `aria-live="polite"`.
  - Spanning live regions across the entire page body, causing screen readers to re-read entire pages on small state updates.
  - Forcing unexpected focus shifts (`element.focus()`) on minor background data refreshes.
- **Evidence:**
  - Toast notification component appending `<div className="toast">Profile Saved</div>` without `role="status"` or `aria-live="polite"`.
- **Avoid:**
  - Flagging static UI elements or live regions configured with appropriate `aria-live="polite"` and `aria-atomic="true"`.
- **Remediation:**
  - Wrap dynamic notifications in `<div role="status" aria-live="polite">` or `<div role="alert">` for critical errors.
- **Severity:** Medium

---

## FA11Y10: Motion, Touch Targets & Reflow Safety

- **Purpose:** Respect user motion preferences (`prefers-reduced-motion`), maintain adequate touch target dimensions, and avoid content clipping during page zoom.
- **Detect:**
  - Non-essential animations, parallax effects, or continuous pulsing transitions that ignore the `@media (prefers-reduced-motion: reduce)` query.
  - Interactive buttons or touch controls styled smaller than 24x24px (WCAG 2.2 AA) or 44x44px target area without adequate spacing.
  - Layouts using fixed pixel widths (`width: 1200px`) causing horizontal scrollbars and text truncation at 320px viewport or 400% zoom.
- **Evidence:**
  - CSS keyframe animation running indefinitely without a `prefers-reduced-motion` override.
  - Mobile icon button with `width: 14px; height: 14px; padding: 0;` causing severe touch target misclicks.
- **Avoid:**
  - Flagging subtle, functional UI transitions (e.g. 150ms opacity fades) that do not cause vestibular discomfort.
- **Remediation:**
  - Wrap complex animations in `@media (prefers-reduced-motion: no-preference)` or provide reduced motion alternatives.
  - Ensure minimum touch target dimensions of 24x24px / 44x44px.
- **Severity:** Medium

