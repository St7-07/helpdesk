import { createContext, useContext, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

type Session = typeof authClient.$Infer.Session;

const SessionContext = createContext<Session | null>(null);

/**
 * Loads the session once for the whole app and shows a loading screen until
 * it's known, so route guards and pages never deal with a pending state.
 * The session updates on its own after sign-in and sign-out.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return <SessionContext value={session}>{children}</SessionContext>;
}

/** The current session, or `null` when signed out. */
export function useSession(): Session | null {
  return useContext(SessionContext);
}

/** The signed-in user. Only use inside `<ProtectedRoute>`. */
export function useCurrentUser(): Session["user"] {
  const session = useSession();
  if (!session) throw new Error("useCurrentUser must be used inside <ProtectedRoute>");
  return session.user;
}
