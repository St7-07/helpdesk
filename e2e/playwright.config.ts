import { defineConfig, devices } from "@playwright/test";
import { admin } from "./fixtures";

// E2E runs its own server and client on separate ports against the test
// database (reset by the server's `serve:test`), so it never touches the dev
// servers or the dev database.
const API_PORT = 3100;
const CLIENT_PORT = 5174;
const clientUrl = `http://localhost:${CLIENT_PORT}`;

export default defineConfig({
  testDir: "./tests",
  // Tests share one database and one seeded admin.
  workers: 1,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: clientUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      name: "server",
      command: "bun run serve:test",
      cwd: "../server",
      env: {
        PORT: String(API_PORT),
        BETTER_AUTH_URL: clientUrl,
        TEST_ADMIN_EMAIL: admin.email,
        TEST_ADMIN_PASSWORD: admin.password,
      },
      url: `http://localhost:${API_PORT}/api/health`,
      reuseExistingServer: false,
    },
    {
      name: "client",
      command: `bunx vite --port ${CLIENT_PORT} --strictPort`,
      cwd: "../client",
      env: { API_URL: `http://localhost:${API_PORT}` },
      url: clientUrl,
      reuseExistingServer: false,
    },
  ],
});
