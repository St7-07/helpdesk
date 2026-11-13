import { useState } from "react";
import { Outlet } from "react-router";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useCurrentUser } from "@/lib/session";

/** Nav bar and page frame for signed-in pages. */
export default function AppLayout() {
  const user = useCurrentUser();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  // <ProtectedRoute> sends us to /login once the session is gone.
  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError(null);
    try {
      const { error } = await authClient.signOut();
      if (!error) return;
    } catch {
      // Network failure: handled below like an error response.
    }
    setSignOutError("Sign out failed. Please try again.");
    setSigningOut(false);
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b bg-background">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="font-semibold">Helpdesk</span>
          <div className="flex items-center gap-4">
            {signOutError && (
              <span role="alert" className="text-sm text-destructive">
                {signOutError}
              </span>
            )}
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Button variant="outline" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
