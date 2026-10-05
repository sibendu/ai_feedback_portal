import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".ai_factory/tests/functional",
  reporter: [["html", { outputFolder: ".ai_factory/tests/reports/playwright-html", open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3187",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  webServer: {
    command: "node ./node_modules/next/dist/bin/next build && node ./node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3187",
    url: "http://127.0.0.1:3187",
    reuseExistingServer: false,
    timeout: 120000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], ...(process.platform === "win32" ? { channel: "chrome" } : {}) }
    }
  ]
});
