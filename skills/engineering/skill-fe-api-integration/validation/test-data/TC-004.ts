export const deleteItem = async (id: string) => {
  const response = await fetch(`/api/items/${id}`, { method: 'DELETE' });
  // Defect FAI04: Calling .json() on 204 No Content throws JSON parse error; missing !response.ok check
  const result = await response.json();
  return result;
};

