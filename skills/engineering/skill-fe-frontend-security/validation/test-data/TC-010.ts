// TC-010: FSEC10 - Insecure Frontend Configuration & Debug Exposure

declare global {
  interface Window {
    __SUPER_ADMIN_BACKDOOR__?: any;
  }
}

// VIOLATION (FSEC10): Exposing unauthenticated debug backdoor on window in production builds
window.__SUPER_ADMIN_BACKDOOR__ = {
  elevatePrivileges: (secret: string) => {
    localStorage.setItem('user_role', 'superadmin');
  },
};

