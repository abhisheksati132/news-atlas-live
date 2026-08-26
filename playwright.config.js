import { defineConfig } from "playwright/test";

const PORT = 5199;

export default defineConfig({
  testDir: "./e2e",
  timeout: 45000,
  retries: 1,
  use: {
    baseURL: `http://localhost:${PORT}`,
    headless: true
  },
  webServer: {
    command: `npm run frontend -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60000
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" }
    }
  ]
});
