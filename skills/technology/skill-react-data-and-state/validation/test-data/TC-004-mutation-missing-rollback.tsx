import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Todo {
  id: string;
  text: string;
}

// BAD: Optimistically updating cache without capturing previous state or defining onError rollback
export function MissingRollbackViolation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newTodo: Todo) =>
      fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
      }).then((res) => res.json()),
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      // Updates cache optimistically but returns nothing for context and provides no onError handler
      queryClient.setQueryData<Todo[]>(['todos'], (old = []) => [...old, newTodo]);
    },
    // Missing onError handler to rollback!
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return (
    <button onClick={() => mutation.mutate({ id: 'temp-1', text: 'New Item' })}>
      Add Item
    </button>
  );
}

// GOOD: Optimistically updates cache, preserves previous snapshot in context, and rolls back on failure
export function SafeOptimisticRollbackPattern() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newTodo: Todo) =>
      fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
      }).then((res) => res.json()),
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

      queryClient.setQueryData<Todo[]>(['todos'], (old = []) => [...old, newTodo]);

      return { previousTodos };
    },
    onError: (_err, _newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return (
    <button onClick={() => mutation.mutate({ id: 'temp-1', text: 'New Item' })}>
      Add Item
    </button>
  );
}

