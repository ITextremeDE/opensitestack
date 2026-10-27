import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { summarize, evaluate } from "./check-budgets.mjs";
import { validateConfig } from "./config.mjs";
const profile = JSON.parse(
  readFileSync(new URL("../../quality/profile.json", import.meta.url)),
);
const config = {
  port: 3100,
  runs: 3,
  minimumPerformance: 0.9,
  maximumLcpMs: 2500,
  maximumCls: 0.1,
  pages: [
    {
      id: "home",
      host: "127.0.0.1",
      path: "/",
      scriptBytes: 1000,
      imageBytes: 0,
      totalBytes: 2000,
    },
  ],
  exceptions: [],
};
const clone = (x) => structuredClone(x);
const measurement = {
  id: "home",
  performance: 0.95,
  lcpMs: 1500,
  cls: 0,
  scriptBytes: 500,
  imageBytes: 0,
  totalBytes: 1000,
};
let runSequence = 0;
function report(score = 0.95, lcp = 1500) {
  return {
    requestedUrl: "http://127.0.0.1:3100/",
    finalDisplayedUrl: "http://127.0.0.1:3100/",
    fetchTime: new Date(++runSequence * 1000).toISOString(),
    lighthouseVersion: profile.lighthouseVersion,
    configSettings: clone(profile),
    categories: { performance: { score } },
    audits: {
      "largest-contentful-paint": { numericValue: lcp },
      "cumulative-layout-shift": { numericValue: 0 },
      "resource-summary": {
        details: {
          items: ["script", "image", "total"].map((resourceType, i) => ({
            resourceType,
            transferSize: [500, 0, 1000][i],
          })),
        },
      },
    },
  };
}
test("uses three runs and an independent median per metric", () => {
  const m = summarize(
    [report(0.91, 2300), report(0.99, 1400), report(0.95, 1800)],
    config,
  )[0];
  assert.equal(m.performance, 0.95);
  assert.equal(m.lcpMs, 1800);
  assert.deepEqual(evaluate([m], config), { errors: [], warnings: [] });
});
test("rejects missing, extra, duplicate and redirected runs", () => {
  assert.throws(() => summarize([report()], config));
  assert.throws(() =>
    summarize([report(), report(), report(), report()], config),
  );
  const duplicate = report();
  assert.throws(() =>
    summarize([duplicate, clone(duplicate), report()], config),
  );
  const r = report();
  r.requestedUrl = "http://localhost:3100/";
  assert.throws(() => summarize([r, report(), report()], config));
  r.requestedUrl = report().requestedUrl;
  r.finalDisplayedUrl = "https://example.com";
  assert.throws(() => summarize([r, report(), report()], config));
});
test("rejects runtime errors, missing metrics, changed versions and weaker throttling", () => {
  for (const mutate of [
    (r) => (r.fetchTime = "invalid"),
    (r) => delete r.finalDisplayedUrl,
    (r) => (r.runtimeError = { code: "NO_FCP" }),
    (r) => (r.lighthouseVersion = "other"),
    (r) => (r.configSettings.formFactor = "desktop"),
    (r) => (r.configSettings.throttlingMethod = "simulate"),
    ...Object.keys(profile.throttling).map(
      (k) => (r) => (r.configSettings.throttling[k] = 0),
    ),
    (r) => (r.audits["resource-summary"].details.items = []),
    (r) => (r.categories.performance.score = null),
    (r) => (r.categories.performance.score = 2),
    (r) => (r.audits["largest-contentful-paint"].numericValue = -1),
  ]) {
    const r = report();
    mutate(r);
    assert.throws(() => summarize([r, report(), report()], config));
  }
});
test("all quality and resource goals block independently and the matrix is complete", () => {
  for (const [key, value] of Object.entries({
    performance: 0.89,
    lcpMs: 2501,
    cls: 0.11,
    scriptBytes: 1001,
    imageBytes: 1,
    totalBytes: 2001,
  })) {
    assert.ok(
      evaluate([{ ...measurement, [key]: value }], config).errors.length,
    );
  }
  assert.ok(evaluate([], config).errors.length);
  assert.ok(evaluate([measurement, measurement], config).errors.length);
});
test("explicit exceptions warn and expiry, missing ownership or unknown pages fail closed", () => {
  const c = clone(config);
  c.exceptions = [
    {
      page: "home",
      metric: "lcpMs",
      limit: 3000,
      expires: "2099-01-01",
      reason: "Tracked work",
      owner: "Example maintainer",
      issue: "https://example.com/issues/1",
    },
  ];
  assert.equal(
    evaluate([{ ...measurement, lcpMs: 2700 }], c).warnings.length,
    1,
  );
  for (const patch of [
    { expires: "2000-01-01" },
    { expires: "2099-02-30" },
    { owner: "" },
    { issue: "http://example.com" },
    { page: "missing" },
    { metric: "scriptBytes" },
    { limit: NaN },
  ]) {
    const bad = clone(c);
    Object.assign(bad.exceptions[0], patch);
    assert.ok(evaluate([measurement], bad).errors.length);
  }
});
test("unsafe hosts and paths, duplicate pages and missing resource budgets fail before collection", () => {
  for (const patch of [
    { host: "example.com" },
    { path: "//example.com" },
    { path: "\\evil" },
    { path: "/x#secret" },
    { scriptBytes: undefined },
    { id: "bad id" },
  ]) {
    const c = clone(config);
    Object.assign(c.pages[0], patch);
    assert.throws(() => validateConfig(c));
  }
  const c = clone(config);
  c.pages.push(clone(c.pages[0]));
  assert.throws(() => validateConfig(c));
});
