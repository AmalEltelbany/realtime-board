import { defineConfig, devices } from "@playwright/test";

const apiEnv = {
  PORT: "4000",
  NODE_ENV: "test",
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://board:board@localhost:5432/board_test?schema=public",
  JWT_SECRET: "e2e-secret-at-least-16-chars",
  WEB_ORIGIN: "http://localhost:3000",
};

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    // Lets the suite reuse a locally installed Chromium instead of downloading one.
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node dist/main.js",
      cwd: "../apps/api",
      url: "http://localhost:4000/api/health",
      env: apiEnv,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm start",
      cwd: "../apps/web",
      url: "http://localhost:3000",
      env: { API_URL: "http://localhost:4000", NEXT_PUBLIC_SOCKET_URL: "http://localhost:4000" },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
