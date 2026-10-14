// Next.js Navigation Hook Mismatch Test Fixtures (NEXT01, NEXT06)

// App Router Component (app/dashboard/page.jsx)
import { useRouter } from "next/router"; // Violation: Mismatched router hook for App Router

export function RouterHookMismatchViolation() {
  const router = useRouter(); // Will fail at runtime in App Router
  return <button onClick={() => router.push("/settings")}>Settings</button>;
}

// App Router Component (app/dashboard/page.jsx)
import { useRouter as useAppRouter } from "next/navigation"; // Safe: App Router navigation hook

export function SafeAppRouterNavigation() {
  const router = useAppRouter();
  return <button onClick={() => router.push("/settings")}>Settings</button>;
}

