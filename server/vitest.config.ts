import { defineConfig } from "vitest/config";
import { testEnv } from "./test/db";

// Point everything (global setup and test workers) at the test database.
const env = testEnv();
Object.assign(process.env, env);

export default defineConfig({
  test: {
    env,
    globalSetup: "./test/global-setup.ts",
    // Test files share one database.
    fileParallelism: false,
  },
});
