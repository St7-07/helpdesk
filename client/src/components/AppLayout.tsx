import { useState } from "react";
import { Outlet } from "react-router";
import { authClient } from "../lib/auth-client";
import { useCurrentUser } from "../lib/session";

/** Nav bar and page frame for signed-in pages. */
export default function AppLayout() {
  const user = useCurrentUser();
  const [signingOut, setSigningOut] = useState(false);

  // <ProtectedRoute> sends us to /login once the session is gone.
  async function handleSignOut() {
    setSigningOut(true);
    const { error } = await authClient.signOut();
    if (error) setSigningOut(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="font-semibold text-gray-900">Helpdesk</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{user.name}</span>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
