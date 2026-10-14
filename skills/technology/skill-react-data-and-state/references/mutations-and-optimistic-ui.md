# React Mutations & Optimistic UI Reference

Provides rules for mutation data integrity, optimistic UI updates, rollback safety, and duplicate submission prevention.

---

## Actionable Technology Rules

### RDS-MUT-001: Optimistic Update Without Rollback on Failure
- **Applies To**: `useMutation`, custom mutation state, optimistic UI patterns.
- **Behavior**: Optimistically updating local cache or component state before server response without capturing previous state snapshot leaves the UI in a corrupted, fake-success state if the server rejects the mutation.
- **Inspect**: `onMutate` handlers writing to cache with `setQueryData` without returning a context object containing the previous snapshot, and missing `onError` rollback.
- **Violation**:
  ```tsx
  export function useToggleTodo() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: updateTodo,
      onMutate: async (newTodo) => {
        await queryClient.cancelQueries({ queryKey: ['todos'] });
        // Violation: Direct cache overwrite without saving previous snapshot!
        queryClient.setQueryData(['todos'], (old: Todo[]) =>
          old.map(t => t.id === newTodo.id ? { ...t, ...newTodo } : t)
        );
      },
      // Violation: Missing onError handler to roll back to snapshot!
    });
  }
  ```
- **Evidence**: `onMutate` updating cache without returning rollback context, and no `onError` restoring data.
- **False Positives**: Non-optimistic mutations where UI updates only occur in `onSuccess`.
- **Remediation**: Capture previous state in `onMutate` and restore it in `onError`:
  ```tsx
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });
    const previousTodos = queryClient.getQueryData(['todos']);
    queryClient.setQueryData(['todos'], (old: Todo[]) => old.map(t => t.id === newTodo.id ? newTodo : t));
    return { previousTodos };
  },
  onError: (err, newTodo, context) => {
    if (context?.previousTodos) {
      queryClient.setQueryData(['todos'], context.previousTodos);
    }
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  }
  ```
- **Engineering Skill Map**: `FSM06`, `skill-fe-state-management`

---

### RDS-MUT-002: Duplicate Form Submissions on Non-Idempotent Mutations
- **Applies To**: Form submit buttons, checkout triggers, payment actions.
- **Behavior**: Allowing rapid multi-click submissions without disabling submit controls or tracking pending mutation status triggers duplicate charges or duplicate entity creations.
- **Inspect**: Click/submit handlers triggering async mutations while button remains enabled and un-disabled during `isPending` / `isLoading`.
- **Violation**:
  ```tsx
  export function PaymentForm({ onPay }: { onPay: () => Promise<void> }) {
    // Violation: Button remains clickable during active payment submission!
    return <button onClick={onPay}>Submit Payment</button>;
  }
  ```
- **Evidence**: Non-idempotent mutation button lacking `disabled={isPending}` or mutation execution lock.
- **False Positives**: Idempotent read-only queries or buttons guarded by debounce/throttling abstractions.
- **Remediation**: Disable the submit action while mutation is executing: `<button disabled={isPending} onClick={onPay}>`.
- **Engineering Skill Map**: `FSM04`, `skill-fe-api-integration`

