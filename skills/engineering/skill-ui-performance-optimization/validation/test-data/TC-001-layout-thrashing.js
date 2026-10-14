// Violation: Alternates reading geometry and mutating DOM inside a loop, causing forced layout thrashing
function LayoutThrashingViolation(elements) {
  for (let i = 0; i < elements.length; i++) {
    const width = elements[i].offsetWidth; // Read layout
    elements[i].style.width = (width + 10) + "px"; // Write layout
  }
}

// Safe Counterpart: Batches reads first, then writes in a separate pass
function SafeBatchedLayoutExecution(elements) {
  const widths = elements.map(el => el.offsetWidth); // Batch reads
  elements.forEach((el, idx) => {
    el.style.width = (widths[idx] + 10) + "px"; // Batch writes
  });
}

