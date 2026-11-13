// Creates the first admin from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
// Public sign-up is disabled, so this goes through Better Auth's internal
// adapter (same path as its admin plugin): user row + "credential" account
// holding the password hash. Safe to re-run: an existing user is left as is.
import { auth } from "./auth";
import { Role } from "./roles";

const email = process.env["SEED_ADMIN_EMAIL"];
const password = process.env["SEED_ADMIN_PASSWORD"];
if (!email || !password) {
  console.error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in server/.env");
  process.exit(1);
}

const ctx = await auth.$context;

if (await ctx.internalAdapter.findUserByEmail(email)) {
  console.log(`Admin ${email} already exists, nothing to do.`);
} else {
  const user = await ctx.internalAdapter.createUser(
    { email, name: "Admin", role: Role.Admin, emailVerified: true },
    { method: "admin" },
  );
  await ctx.internalAdapter.linkAccount({
    providerId: "credential",
    accountId: user.id,
    userId: user.id,
    password: await ctx.password.hash(password),
  });
  console.log(`Created admin ${email}.`);
}

process.exit(0);
