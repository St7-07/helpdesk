// Test database helpers, shared by the server tests (Vitest) and the e2e
// tests (Playwright). Tests never touch the dev database: they use
// TEST_DATABASE_URL, or DATABASE_URL with "_test" appended to the db name.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "dotenv";
import pg from "pg";

const serverDir = fileURLToPath(new URL("..", import.meta.url));

/** Environment for any process that runs against the test database. */
export function testEnv(): Record<string, string> {
  let fileEnv: Record<string, string> = {};
  try {
    fileEnv = parse(readFileSync(`${serverDir}/.env`));
  } catch {
    // No server/.env (e.g. CI): rely on the process environment.
  }
  const devUrl = fileEnv["DATABASE_URL"] ?? process.env["DATABASE_URL"];

  let url = process.env["TEST_DATABASE_URL"] ?? fileEnv["TEST_DATABASE_URL"];
  if (!url) {
    if (!devUrl) throw new Error("Set DATABASE_URL or TEST_DATABASE_URL");
    const parsed = new URL(devUrl);
    parsed.pathname = `${parsed.pathname}_test`;
    url = parsed.toString();
  }
  assertSafeTestDatabase(url, [fileEnv["DATABASE_URL"], process.env["DATABASE_URL"]]);

  return {
    // Also exported so a second call (e.g. in a child process) stays on it.
    TEST_DATABASE_URL: url,
    DATABASE_URL: url,
    BETTER_AUTH_SECRET: "test-secret-not-for-production-0123456789",
    BETTER_AUTH_URL: process.env["BETTER_AUTH_URL"] ?? fileEnv["BETTER_AUTH_URL"] ?? "http://localhost:5173",
  };
}

/**
 * Tests migrate and empty their database, so refuse anything that isn't
 * clearly a test database: its name must end in "_test", and it must not be
 * the same database as a dev URL (compared by host, port and name, so a
 * different spelling of the same URL doesn't slip through).
 */
export function assertSafeTestDatabase(testUrl: string, devUrls: (string | undefined)[]): void {
  const test = databaseIdentity(testUrl);
  if (!test.endsWith("_test")) {
    throw new Error(`Refusing to run tests: database "${test.split("/").pop()}" must end in "_test"`);
  }
  for (const devUrl of devUrls) {
    // A process that already ran testEnv() has DATABASE_URL = the test URL.
    if (devUrl && devUrl !== testUrl && databaseIdentity(devUrl) === test) {
      throw new Error("Refusing to run tests: TEST_DATABASE_URL points at the DATABASE_URL database");
    }
  }
}

/** "host:port/dbname", with local host spellings and the default port unified. */
function databaseIdentity(databaseUrl: string): string {
  const url = new URL(databaseUrl);
  const host = url.hostname.toLowerCase();
  const isLocal = ["", "localhost", "127.0.0.1", "[::1]"].includes(host);
  return `${isLocal ? "localhost" : host}:${url.port || "5432"}/${decodeURIComponent(url.pathname.slice(1))}`;
}

/** Creates the test database if needed, applies migrations and empties it. */
export async function resetTestDatabase(env = testEnv()): Promise<void> {
  const url = new URL(env.DATABASE_URL!);
  const dbName = url.pathname.slice(1);

  const admin = new pg.Client({ connectionString: Object.assign(new URL(url), { pathname: "/postgres" }).toString() });
  await admin.connect();
  try {
    const { rowCount } = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (!rowCount) await admin.query(`CREATE DATABASE "${dbName.replaceAll('"', '""')}"`);
  } finally {
    await admin.end();
  }

  const migrate = spawnSync("bun", ["run", "db:migrate"], {
    cwd: serverDir,
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
  if (migrate.status !== 0) {
    throw new Error(`Test database migration failed:\n${migrate.stdout}\n${migrate.stderr}`);
  }

  await truncateAll(env.DATABASE_URL!);
}

/** Deletes all rows from the app tables (keeps the schema). */
export async function truncateAll(databaseUrl: string): Promise<void> {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query('TRUNCATE "session", "account", "verification", "user" RESTART IDENTITY CASCADE');
  } finally {
    await client.end();
  }
}
