// `bun run serve:test`: the API the e2e tests run against. Resets the test
// database, creates the admin given in TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD,
// then starts the server (PORT, BETTER_AUTH_URL from the environment).
import { resetTestDatabase, testEnv } from "./db";

const email = process.env["TEST_ADMIN_EMAIL"];
const password = process.env["TEST_ADMIN_PASSWORD"];
if (!email || !password) {
  console.error("Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD");
  process.exit(1);
}

// Before importing app code: it reads DATABASE_URL when loaded.
const env = testEnv();
Object.assign(process.env, env);
await resetTestDatabase(env);

const { Role } = await import("../src/roles");
const { createUserWithPassword } = await import("../src/users");
await createUserWithPassword({ email, password, name: "Admin", role: Role.Admin });

await import("../src/index");
