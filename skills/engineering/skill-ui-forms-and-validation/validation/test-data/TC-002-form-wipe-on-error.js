// Violation: Clears all form fields to default empty state on backend error
function FormWipeOnErrorViolation(error, formState) {
  formState.values = {};
  formState.globalError = error.message;
}

// Safe Counterpart: Maps server error to target field while retaining current user input values
function SafeFieldErrorMapping(error, formState) {
  if (error.fieldErrors) {
    formState.errors = { ...error.fieldErrors };
  } else {
    formState.globalError = error.message;
  }
}

