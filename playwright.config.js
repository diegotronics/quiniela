import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT) || 5179;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/ui",
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "tests/ui/report", open: "never" }],
    ["json", { outputFile: "tests/ui/report/results.json" }],
  ],
  timeout: 60_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: BASE_URL,
    actionTimeout: 8_000,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
    locale: "es-VE",
    timezoneId: "America/Caracas",
    colorScheme: "light",
  },
  outputDir: "tests/ui/test-results",
  projects: [
    {
      name: "mobile-light",
      use: {
        ...devices["Pixel 5"],
        colorScheme: "light",
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: "mobile-dark",
      use: {
        ...devices["Pixel 5"],
        colorScheme: "dark",
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: "desktop-light",
      use: {
        ...devices["Desktop Chrome"],
        colorScheme: "light",
        viewport: { width: 1280, height: 900 },
      },
    },
    {
      name: "desktop-dark",
      use: {
        ...devices["Desktop Chrome"],
        colorScheme: "dark",
        viewport: { width: 1280, height: 900 },
      },
    },
  ],
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
