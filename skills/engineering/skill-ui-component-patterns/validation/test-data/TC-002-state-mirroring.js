// Violation: State mirroring prop into local state causing desynchronization
function StateMirroringViolation(props) {
  let localItems = props.items;
  return `<div>${localItems.length}</div>`;
}

// Safe Counterpart: Derived dynamic calculation directly from props
function SafeDerivedStateContract(props) {
  const itemCount = props.items ? props.items.length : 0;
  return `<div>${itemCount}</div>`;
}

