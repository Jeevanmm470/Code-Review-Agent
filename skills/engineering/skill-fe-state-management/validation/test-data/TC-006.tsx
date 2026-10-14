import React, { useState } from 'react';

// TC-006: FSM06 - Cache Invalidation & Optimistic Rollbacks
export function TodoList({ initialTodos, deleteApi }: { initialTodos: Array<{ id: string; text: string }>; deleteApi: (id: string) => Promise<void> }) {
  const [todos, setTodos] = useState(initialTodos);

  const handleDelete = async (id: string) => {
    // VIOLATION (FSM06): Optimistic deletion without saving snapshot or rolling back on API failure
    setTodos(todos.filter((t) => t.id !== id));
    try {
      await deleteApi(id);
    } catch (err) {
      console.error('Delete failed:', err);
      // Missing rollback: UI permanently shows item as deleted even though server rejected
    }
  };

  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>
          {t.text} <button onClick={() => handleDelete(t.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

