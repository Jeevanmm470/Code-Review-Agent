// Violation: Component directly mutates incoming props
function DirectPropMutationViolation(props) {
  props.user.name = "Mutated Name";
  return `<div>${props.user.name}</div>`;
}

// Safe Counterpart: Emits explicit event/callback without mutating props
function SafeImmutablePropContract(props) {
  const updatedUser = { ...props.user, name: "New Name" };
  props.onUserChange(updatedUser);
  return `<div>${props.user.name}</div>`;
}

