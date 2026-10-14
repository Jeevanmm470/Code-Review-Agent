// TC-007: FSM07 - Persistence Schema & State Restoration

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: { email: boolean; push: boolean };
}

export function loadUserPreferences(): UserPreferences {
  // VIOLATION (FSM07): Deserializing persisted state without null safety or schema migration checks
  const raw = localStorage.getItem('user_prefs')!;
  const parsed = JSON.parse(raw);
  // Crashes with TypeError when previous app version stored different structure (e.g. notifications missing)
  return parsed as UserPreferences;
}

