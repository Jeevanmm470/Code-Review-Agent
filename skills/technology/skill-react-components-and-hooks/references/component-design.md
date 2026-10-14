# React Component Design & Props Reference

Provides React component boundary, props contract, and composition review rules for specialist review agents.

---

## Actionable Technology Rules

### REACT-COMP-001: Component Cohesion & Responsibilities
- **Applies To**: React functional components, custom UI components, container views.
- **Behavior**: Components mixing raw domain calculations, network I/O, local timers, and deeply nested UI trees become difficult to test and maintain.
- **Inspect**: Component bodies containing inline data parsing, multi-endpoint `fetch` calls, and >100 lines of disparate JSX layouts.
- **Violation**:
  ```tsx
  export function InvoiceViewer({ invoiceId }: { invoiceId: string }) {
    const [invoice, setInvoice] = useState<any>(null);
    const [taxRate, setTaxRate] = useState(0.2);
    // Directly doing math, network fetch, printing, and dialog layout inside one component
    const calculateTotal = (items: any[]) => items.reduce((acc, i) => acc + i.price * (1 + taxRate), 0);
    // ...
  }
  ```
- **Evidence**: Component mixing raw domain calculation helpers + API fetch + presentation JSX.
- **False Positives**: Self-contained form widgets managing their own cohesive field state and submit handlers.
- **Remediation**: Extract calculation helpers into pure domain modules and data fetching into custom hooks.
- **Engineering Skill Map**: `FCD01`, `FCD02`, `skill-eng-modularity`

---

### REACT-COMP-002: Controlled vs Uncontrolled Props Contracts
- **Applies To**: Input components, custom dropdowns, toggle switches, form controls.
- **Behavior**: Mixing internal `useState` with incoming `value` prop without synchronization creates split-brain state where parent updates are ignored or local changes overwrite parent state unexpectedly.
- **Inspect**: Components declaring `const [val, setVal] = useState(props.value)` without observing `props.value` changes or lacking `onChange` emissions.
- **Violation**:
  ```tsx
  export function SearchInput({ value, onChange }: { value?: string; onChange?: (v: string) => void }) {
    const [innerVal, setInnerVal] = useState(value); // Ignores future updates to props.value!
    return <input value={innerVal} onChange={(e) => setInnerVal(e.target.value)} />;
  }
  ```
- **Evidence**: Initializing state once with a controlled prop value without a synchronization mechanism or explicit `defaultValue` naming.
- **False Positives**: Uncontrolled components explicitly accepting `defaultValue` or `initialValue` prop intended only for initial mount.
- **Remediation**: Choose either fully controlled (`value` + `onChange`) or fully uncontrolled (`defaultValue`). If supporting both, use a controlled state reducer or custom hook (`useControllableState`).
- **Engineering Skill Map**: `FCD04`, `skill-fe-state-management`

---

### REACT-COMP-003: Props Drilling vs Composition & Children
- **Applies To**: Deep component hierarchies (3+ levels passing identical props down the tree).
- **Behavior**: Passing unrelated props through intermediate container components creates tight coupling and fragility.
- **Inspect**: Intermediate wrapper components accepting 5+ props merely to forward them unchanged to leaf components.
- **Violation**:
  ```tsx
  function Page({ user, theme, onLogout, notifications }: PageProps) {
    return <Header user={user} theme={theme} onLogout={onLogout} notifications={notifications} />;
  }
  ```
- **Evidence**: Pass-through props forwarded across multiple intermediate layout layers.
- **False Positives**: High-order layout wrappers forwarding props to dynamically rendered child components via render props.
- **Remediation**: Use component composition (`children` prop), slot props, or React Context for ambient global state (e.g. theme, auth).
- **Engineering Skill Map**: `FCD05`, `skill-eng-modularity`

---

### REACT-COMP-004: Anti-Pattern Component Abstractions & God Props
- **Applies To**: Reusable UI components, design system buttons, modal dialogs.
- **Behavior**: Components accepting dozens of boolean flags (`isCompact`, `isCard`, `hasCustomHeader`, `withSpecialFooter`, `mode="v2"`) that alter fundamental layout and behavior.
- **Inspect**: Components with extensive conditional rendering branching into completely different DOM structures based on flags.
- **Evidence**: Component with >5 boolean layout flags resulting in combinatorial visual permutations.
- **False Positives**: Standard HTML attribute forwarding (`ButtonHTMLAttributes<HTMLButtonElement>`).
- **Remediation**: Break the component into composable compound components (e.g., `<Card.Header>`, `<Card.Body>`, `<Card.Footer>`).
- **Engineering Skill Map**: `FCD04`, `FCD06`

