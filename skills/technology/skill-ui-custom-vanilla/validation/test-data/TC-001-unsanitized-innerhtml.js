// Violation: Directly interpolates untrusted dynamic user string into innerHTML
function UnsanitizedInnerHTMLViolation(container, userInput) {
  container.innerHTML = `<span>${userInput}</span>`;
}

// Safe Counterpart: Uses textContent or safe DOM node construction to prevent XSS
function SafeTextContent DOMUpdate(container, userInput) {
  const span = document.createElement("span");
  span.textContent = userInput;
  container.replaceChildren(span);
}

