# Context & External Store Subscriptions Reference

## 1. Overview & Mechanics

React Context propagates values down the component tree. When a Context Provider's `value` changes (checked via `Object.is`), **every consumer of that context re-renders**, bypassing `React.memo` optimizations on intermediate components.

Key performance hazards:
1. **Unmemoized Provider Values**: Passing `{ state, dispatch }` as an inline object literal causes every consumer in the entire tree to re-render whenever the provider component re-renders for any reason.
2. **Monolithic Contexts**: Combining frequently changing state (e.g. scroll position, timer ticks, mouse coords) with rarely changing state (e.g. theme, user auth) in the same context object.
3. **Store Subscriptions & Tearing**: Using naive `useEffect` store subscriptions instead of `useSyncExternalStore`, risking tearing or missing updates during Concurrent rendering.

---

## 2. Detailed Review Rules

### RRP-CTX-001: Unmemoized Context Provider Value (`RRP05`)

- **Defect**: Passing a freshly constructed object or array literal directly into `<Context.Provider value={{ ... }}>` inside a provider component that holds local state.
- **Consequence**: Whenever the provider re-renders, a new object reference is provided, triggering re-render cascades across all consuming components regardless of whether inner state changed.
- **Detection Pattern**:
  ```tsx
  export const ThemeContext = createContext<ThemeContextType | null>(null);

  // BAD: Provider value object recreated on every render
  export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [accentColor, setAccentColor] = useState('blue');

    return (
      <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor }}>
        {children}
      </ThemeContext.Provider>
    );
  }
  ```
- **Remediation**:
  ```tsx
  export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [accentColor, setAccentColor] = useState('blue');

    const value = useMemo(() => ({
      theme,
      setTheme,
      accentColor,
      setAccentColor,
    }), [theme, accentColor]);

    return (
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    );
  }
  ```

---

### RRP-CTX-002: Context Splitting for High-Frequency State (`RRP05`)

- **Defect**: Storing high-frequency state (e.g. active cursor coordinates, continuous animation progress) in the same Context as low-frequency data (user permissions, app theme).
- **Consequence**: Components that only care about static data are forced to re-render on every animation frame or coordinate update.
- **Remediation**: Split state and dispatch into separate contexts, or split high-frequency values into separate specialized contexts.
  ```tsx
  // Split State and Dispatch into separate contexts
  const StateContext = createContext<AppState | null>(null);
  const DispatchContext = createContext<AppDispatch | null>(null);

  export function AppProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    return (
      <DispatchContext.Provider value={dispatch}>
        <StateContext.Provider value={state}>
          {children}
        </StateContext.Provider>
      </DispatchContext.Provider>
    );
  }
  ```

---

### RRP-CTX-003: External Store Subscriptions via `useSyncExternalStore` (`RRP09`)

- **Defect**: Subscribing to mutable external stores, global caches, or browser APIs via custom `useEffect` + `useState` without concurrent safety or selector stability.
- **Consequence**: Causes visual tearing under Concurrent Mode, extra render passes on mount, and stale snapshots.
- **Remediation**: Use `useSyncExternalStore` with stable `subscribe` and `getSnapshot` callbacks.
  ```tsx
  // GOOD: Concurrent-safe external store subscription
  function useWindowWidth() {
    const subscribe = useCallback((callback: () => void) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    }, []);

    const getSnapshot = () => window.innerWidth;
    const getServerSnapshot = () => 1024; // SSR fallback

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  }
  ```

---

## 3. False-Positive Safeguards

1. **Static Context Values**: If a Context Provider is at the top of the application root and never re-renders (no local state), an inline value does not trigger cascades.
2. **Context Selectors with Libraries**: When using libraries like Zustand, Redux Toolkit, or Jotai with fine-grained selectors, consuming components only re-render when their selected slice changes.

