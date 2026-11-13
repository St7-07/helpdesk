import type { useSession } from "@/lib/session";

type Session = NonNullable<ReturnType<typeof useSession>>;

/** A signed-in session for tests that mock `@/lib/session`. */
export function fakeSession(user: Partial<Session["user"]> = {}): Session {
  const now = new Date();
  return {
    user: {
      id: "user-1",
      name: "Agent Smith",
      email: "agent@example.com",
      emailVerified: true,
      image: null,
      role: "agent",
      createdAt: now,
      updatedAt: now,
      ...user,
    },
    session: {
      id: "session-1",
      userId: "user-1",
      token: "token",
      expiresAt: new Date(now.getTime() + 60_000),
      ipAddress: null,
      userAgent: null,
      createdAt: now,
      updatedAt: now,
    },
  } as Session;
}
