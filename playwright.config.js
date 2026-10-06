import { defineConfig } from "playwright/test";

const PORT = 5173;

export default defineConfig({
  testDir: "./e2e",
  timeout: 45000,
  retries: 1,
  use: {
    baseURL: `http://localhost:${PORT}`,
    headless: true,
    trace: "retain-on-failure"
  },
  webServer: [
    {
      command: "node server.js",
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 30000
    },
    {
      command: `npm run frontend -- --port ${PORT} --strictPort`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 60000
    }
  ],
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" }
    }
  ]
});
