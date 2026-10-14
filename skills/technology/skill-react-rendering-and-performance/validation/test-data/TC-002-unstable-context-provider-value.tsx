import React, { createContext, useState, ReactNode, useMemo } from 'react';

interface AuthContextType {
  user: string | null;
  login: (name: string) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// BAD: Passing new object literal to Context Provider on every render
// Every consumer of AuthContext re-renders whenever AuthProvider re-renders.
export function UnstableContextProviderViolation({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);

  const login = (name: string) => {
    setUser(name);
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
}

// GOOD: Context Provider value is memoized with useMemo
export function SafeMemoizedContextProviderPattern({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);

  const value = useMemo(() => ({
    user,
    login: (name: string) => setUser(name),
  }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

