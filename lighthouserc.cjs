/* Lighthouse CI loads CommonJS configuration. */
/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("@playwright/test");
const config = require("./scripts/quality/config.mjs").loadConfig();
const profile = require("./quality/profile.json");
module.exports = {
  ci: {
    collect: {
      url: config.pages.map(
        (page) => `http://${page.host}:${config.port}${page.path}`,
      ),
      numberOfRuns: config.runs,
      startServerCommand: `pnpm --filter @opensitestack/example-basic start --port ${config.port}`,
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 60000,
      chromePath: chromium.executablePath(),
      settings: {
        onlyCategories: ["performance"],
        formFactor: profile.formFactor,
        throttlingMethod: profile.throttlingMethod,
        throttling: profile.throttling,
        chromeFlags:
          '--headless --no-sandbox --disable-dev-shm-usage --host-resolver-rules="MAP *.localhost 127.0.0.1"',
      },
    },
  },
};
