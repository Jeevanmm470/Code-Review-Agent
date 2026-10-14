import React, { useState } from 'react';

interface Task {
  id: string;
  title: string;
}

// Violation: Mutating state array in place via .push() before calling setTasks
export function InPlaceStateMutationViolation() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleAddTask = (title: string) => {
    // Violation: Direct array mutation
    tasks.push({ id: Date.now().toString(), title });
    setTasks(tasks);
  };

  return (
    <div>
      <button onClick={() => handleAddTask('New Task')}>Add</button>
      <ul>{tasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>
    </div>
  );
}

// Safe Counterpart: Creates a new immutable array copy
export function SafeImmutableStatePattern() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleAddTask = (title: string) => {
    setTasks(prev => [...prev, { id: Date.now().toString(), title }]);
  };

  return (
    <div>
      <button onClick={() => handleAddTask('New Task')}>Add</button>
      <ul>{tasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>
    </div>
  );
}

