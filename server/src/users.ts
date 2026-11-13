import { auth } from "./auth";
import type { Role } from "./roles";

type NewUser = { email: string; password: string; name: string; role: Role };

/**
 * Creates a user who can sign in with email and password. Public sign-up is
 * disabled, so this goes through Better Auth's internal adapter (same path as
 * its admin plugin): user row + "credential" account holding the password hash.
 * Returns `null` when a user with that email already exists.
 */
export async function createUserWithPassword({ email, password, name, role }: NewUser) {
  const ctx = await auth.$context;
  if (await ctx.internalAdapter.findUserByEmail(email)) return null;

  const user = await ctx.internalAdapter.createUser(
    { email, name, role, emailVerified: true },
    { method: "admin" },
  );
  await ctx.internalAdapter.linkAccount({
    providerId: "credential",
    accountId: user.id,
    userId: user.id,
    password: await ctx.password.hash(password),
  });
  return user;
}
