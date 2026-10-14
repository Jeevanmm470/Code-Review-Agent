// Defect FCD10: Multiple uncoordinated sibling components mutating global cart state independently
let globalCartCount = 0;

export const ComponentA = () => {
  const addToCart = () => { globalCartCount += 1; };
  return <button onClick={addToCart}>Add</button>;
};

export const ComponentB = () => {
  const directOverride = () => { globalCartCount = 99; };
  return <button onClick={directOverride}>Set 99</button>;
};

