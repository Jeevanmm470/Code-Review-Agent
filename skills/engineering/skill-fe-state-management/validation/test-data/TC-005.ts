// TC-005: FSM05 - Shared & Global State Store Isolation

class GlobalUserSessionStore {
  public currentUser: { id: string; email: string; token: string } | null = null;

  setUser(user: { id: string; email: string; token: string }) {
    this.currentUser = user;
  }
}

// VIOLATION (FSM05): Module-level global singleton store in SSR environment leaking session data between concurrent requests
export const sharedSessionStore = new GlobalUserSessionStore();

