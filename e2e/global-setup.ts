import { spawnSync } from "node:child_process";
import { resetTestDatabase, testEnv } from "../server/test/test-db";
import { admin } from "./fixtures";

/** Fresh test database with one admin before the e2e run. */
export default async function globalSetup() {
  const env = testEnv();
  await resetTestDatabase(env);

  const seed = spawnSync("bun", ["run", "db:seed"], {
    cwd: new URL("../server", import.meta.url),
    env: { ...process.env, ...env, SEED_ADMIN_EMAIL: admin.email, SEED_ADMIN_PASSWORD: admin.password },
    encoding: "utf8",
  });
  if (seed.status !== 0) throw new Error(`Seeding the e2e admin failed:\n${seed.stdout}\n${seed.stderr}`);
}
