# React State Ownership, Invariants & Immutability Reference

Provides rules for state ownership, immutability, state transitions, and context boundary design in React applications.

---

## Actionable Technology Rules

### RDS-STATE-001: Competing Sources of Truth & Duplicate State
- **Applies To**: `useState`, `useReducer`, global stores, prop mirroring.
- **Behavior**: Copying server data or prop values into secondary state variables creates competing sources of truth where updates to one leave the other stale and desynchronized.
- **Inspect**: Components maintaining local state copies of data already managed by a parent, context, or query cache, and failing to keep them synchronized.
- **Violation**:
  ```tsx
  export function UserEditor({ user, onSave }: { user: User; onSave: (u: User) => void }) {
    const [name, setName] = useState(user.name); // Duplicate copy
    const [email, setEmail] = useState(user.email);
    // If incoming `user` prop updates from background refetch, name/email retain stale values!
  }
  ```
- **Evidence**: Component initializing local state from props/server data without a deliberate draft editing boundary or sync mechanism.
- **False Positives**: Intentional form draft buffers where user input must remain isolated until explicit "Submit" or "Cancel" action.
- **Remediation**: Read directly from the authoritative source (props/query cache) or use a clear form draft model with explicit reset handlers when entity IDs change (`key={user.id}`).
- **Engineering Skill Map**: `FSM01`, `skill-fe-state-management`

---

### RDS-STATE-002: In-Place State Mutation
- **Applies To**: `useState`, `useReducer`, Zustand, Redux actions.
- **Behavior**: Mutating objects or arrays in-place (`state.push()`, `state.items[0].done = true`) before passing to `setState` prevents React from detecting changes (due to reference equality checks), causing skipped re-renders and subtle rendering bugs.
- **Inspect**: Array mutating methods (`.push()`, `.splice()`, `.sort()`, `.reverse()`) or direct object property assignment (`obj.prop = val`) on state variables.
- **Violation**:
  ```tsx
  export function TaskList() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const addTask = (title: string) => {
      tasks.push({ id: Date.now().toString(), title }); // In-place mutation!
      setTasks(tasks); // React ignores update because tasks === tasks
    };
    return <div>...</div>;
  }
  ```
- **Evidence**: Direct mutation of array/object reference followed by passing same reference to state setter.
- **False Positives**: Mutations inside Immer producers (e.g. `produce((draft) => { draft.push(...) })` or Redux Toolkit `createSlice`).
- **Remediation**: Use immutable copy operations (`setTasks(prev => [...prev, newTask])`) or Immer.
- **Engineering Skill Map**: `FSM09`, `skill-fe-state-management`

---

### RDS-STATE-003: Contradictory State Flags (Impossible States)
- **Applies To**: Managing request status via independent booleans (`isLoading`, `isError`, `isSuccess`, `data`).
- **Behavior**: Managing separate boolean flags allows impossible state combinations (e.g. `isLoading === true` and `isError === true` simultaneously) when flag resets are missed during retries or errors.
- **Inspect**: Multiple boolean states representing a single lifecycle status updated independently.
- **Violation**:
  ```tsx
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<Item[] | null>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    // Forgot setIsError(false); -> If previously failed, both isLoading and isError are now true!
    const res = await api.get();
    setData(res);
    setIsLoading(false);
  };
  ```
- **Evidence**: State transitions failing to reset opposing status flags.
- **False Positives**: Independent flags representing distinct concurrent processes (e.g. `isInitialLoading` vs `isExportingBackgroundReport`).
- **Remediation**: Use a single status enum or discriminated union (`type Status = 'idle' | 'loading' | 'success' | 'error'`).
- **Engineering Skill Map**: `FSM04`, `skill-fe-state-management`

