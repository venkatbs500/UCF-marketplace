import { defineConfig, devices } from "@playwright/test";

const E2E_PORT = process.env.PLAYWRIGHT_PORT ?? "3100";
const baseURL = `http://127.0.0.1:${E2E_PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev:e2e",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
