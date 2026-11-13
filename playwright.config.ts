import { defineConfig, devices } from "@playwright/test";
import { testEnv } from "./server/test/test-db";

// E2E runs its own server and client on separate ports against the test
// database, so it never touches the dev servers or the dev database.
const API_PORT = 3100;
const CLIENT_PORT = 5174;
const clientUrl = `http://localhost:${CLIENT_PORT}`;
const serverEnv = { ...testEnv(), PORT: String(API_PORT), BETTER_AUTH_URL: clientUrl };

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  // Tests share one database and one seeded admin.
  workers: 1,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 1 : 0,
  // HTML report in playwright-report/ (open with `bunx playwright show-report`).
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: clientUrl,
    // Step-by-step trace (DOM snapshots, network, console) viewable in the report.
    trace: "on",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      name: "server",
      command: "bun src/index.ts",
      cwd: "./server",
      env: serverEnv,
      url: `http://localhost:${API_PORT}/api/health`,
      reuseExistingServer: false,
    },
    {
      name: "client",
      command: `bunx vite --port ${CLIENT_PORT} --strictPort`,
      cwd: "./client",
      env: { API_URL: `http://localhost:${API_PORT}` },
      url: clientUrl,
      reuseExistingServer: false,
    },
  ],
});
