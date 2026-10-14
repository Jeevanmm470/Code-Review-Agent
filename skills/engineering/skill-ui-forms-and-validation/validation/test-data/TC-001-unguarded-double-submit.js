// Violation: Submits form without pending status check causing double submit
async function UnguardedDoubleSubmitViolation(formData, api) {
  return await api.post("/submit", formData);
}

// Safe Counterpart: Checks and updates submitting flag to guard against duplicate submits
async function SafeGuardedSubmissionLifecycle(formData, api, formState) {
  if (formState.isSubmitting) return;
  formState.isSubmitting = true;
  try {
    return await api.post("/submit", formData);
  } finally {
    formState.isSubmitting = false;
  }
}

