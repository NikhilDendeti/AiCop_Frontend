import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run the real app against a real backend in dev mode
 * (DEV_FIXED_OTP=123456 and `seed_demo` applied).
 *
 *   E2E_API_URL   backend origin (default http://localhost:8001)
 *   E2E_BROWSER   Playwright channel: "chrome" (default), "msedge", or "chromium"
 *                 (after `npx playwright install chromium`, as in CI)
 */
const API = process.env.E2E_API_URL ?? "http://localhost:8001";
const PORT = Number(process.env.E2E_PORT ?? 8080);
const channel = process.env.E2E_BROWSER ?? "chrome";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "en-US",
  },
  projects: [
    {
      name: "desktop",
      testIgnore: /mobile\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], ...(channel === "chromium" ? {} : { channel }) },
    },
    {
      name: "mobile",
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices["Pixel 7"], ...(channel === "chromium" ? {} : { channel }) },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: { VITE_API_BASE_URL: API, VITE_IDLE_TIMEOUT_MINUTES: "0" },
  },
});
