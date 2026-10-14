import React, { useState } from 'react';

interface Todo {
  id: string;
  text: string;
}

// Violation: Rendering dynamic/mutable list using array index as key
export function IndexKeyMutableListViolation({ todos, onDelete }: { todos: Todo[]; onDelete: (id: string) => void }) {
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}>
          <input defaultValue={todo.text} />
          <button onClick={() => onDelete(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

// Safe Counterpart: Uses unique, persistent entity id as key
export function SafeEntityKeyPattern({ todos, onDelete }: { todos: Todo[]; onDelete: (id: string) => void }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <input defaultValue={todo.text} />
          <button onClick={() => onDelete(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

