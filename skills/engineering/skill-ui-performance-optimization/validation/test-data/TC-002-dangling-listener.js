// Violation: Registers global window resize listener without returning cleanup teardown
function DanglingListenerViolation(handler) {
  window.addEventListener("resize", handler);
}

// Safe Counterpart: Returns explicit teardown cleanup function to unbind event listener
function SafeTeardownListenerCleanup(handler) {
  window.addEventListener("resize", handler);
  return () => {
    window.removeEventListener("resize", handler);
  };
}

