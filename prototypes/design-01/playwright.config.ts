import { defineConfig } from "@playwright/test";

// Uses the Chromium preinstalled in the environment (PLAYWRIGHT_BROWSERS_PATH) instead of downloading one.
const executablePath = process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium";

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  workers: 4,
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  use: {
    baseURL: "http://localhost:3100",
    locale: "he-IL",
    timezoneId: "Asia/Jerusalem",
    colorScheme: "dark",
    launchOptions: { executablePath },
  },
  webServer: { command: "npm run start", url: "http://localhost:3100/s01", reuseExistingServer: true, timeout: 60_000 },
});
