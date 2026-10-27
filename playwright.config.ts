import { defineConfig } from "@playwright/test";
import { loadConfig } from "./scripts/quality/config.mjs";
const quality = loadConfig();
export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: true,
  retries: 0,
  workers: 2,
  use: {
    baseURL: `http://127.0.0.1:${quality.port}`,
    headless: true,
    trace: "retain-on-failure",
    launchOptions: {
      args: ["--host-resolver-rules=MAP *.localhost 127.0.0.1"],
    },
  },
  reporter: [["list"], ["json", { outputFile: "var/quality/playwright.json" }]],
  webServer: {
    command: `pnpm --filter @opensitestack/example-basic start --port ${quality.port}`,
    url: `http://127.0.0.1:${quality.port}`,
    reuseExistingServer: false,
    timeout: 60000,
  },
});
