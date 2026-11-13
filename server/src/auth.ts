import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Reads BETTER_AUTH_SECRET and BETTER_AUTH_URL from the environment.
// Tables are owned by the Prisma contract (src/prisma/contract.prisma), so
// don't run Better Auth's own `migrate`/`generate` CLI.
export const auth = betterAuth({
  database: new Pool({ connectionString: process.env["DATABASE_URL"] }),
  emailAndPassword: { enabled: true },
});
