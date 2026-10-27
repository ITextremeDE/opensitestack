import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadConfig, pageUrl, validateConfig } from "./config.mjs";
import profile from "../../quality/profile.json" with { type: "json" };
export const median = (values) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
export function summarize(reports, config, expectedProfile = profile) {
  validateConfig(config);
  if (reports.length !== config.pages.length * 3)
    throw new Error("Expected exactly three reports per page");
  return config.pages.map((page) => {
    const url = pageUrl(page, config),
      samples = reports.filter((r) => r.requestedUrl === url);
    if (samples.length !== 3)
      throw new Error(`${page.id}: missing or duplicate runs`);
    for (const r of samples) {
      const settings = r.configSettings;
      if (
        r.runtimeError ||
        r.lighthouseVersion !== expectedProfile.lighthouseVersion ||
        settings?.formFactor !== expectedProfile.formFactor ||
        settings?.throttlingMethod !== expectedProfile.throttlingMethod ||
        !Object.entries(expectedProfile.throttling).every(
          ([key, value]) =>
            Number.isFinite(settings?.throttling?.[key]) &&
            Math.abs(settings.throttling[key] - value) < 1e-7,
        ) ||
        (r.finalDisplayedUrl && r.finalDisplayedUrl !== url)
      )
        throw new Error(`${page.id}: invalid report or lab profile`);
    }
    const measure = (fn, max = Infinity) => {
      const values = samples.map(fn);
      if (values.some((v) => !Number.isFinite(v) || v < 0 || v > max))
        throw new Error(`${page.id}: missing finite metric`);
      return median(values);
    };
    const bytes = (type) =>
      measure(
        (r) =>
          r.audits["resource-summary"].details.items.find(
            (x) => x.resourceType === type,
          )?.transferSize,
      );
    return {
      id: page.id,
      url,
      performance: measure((r) => r.categories.performance.score, 1),
      lcpMs: measure((r) => r.audits["largest-contentful-paint"].numericValue),
      cls: measure((r) => r.audits["cumulative-layout-shift"].numericValue),
      scriptBytes: bytes("script"),
      imageBytes: bytes("image"),
      totalBytes: bytes("total"),
    };
  });
}
export function evaluate(
  measurements,
  config,
  today = new Date().toISOString().slice(0, 10),
) {
  validateConfig(config);
  const errors = [],
    warnings = [];
  const goals = {
    performance: ["min", config.minimumPerformance],
    lcpMs: ["max", config.maximumLcpMs],
    cls: ["max", config.maximumCls],
  };
  const seen = new Set();
  for (const e of config.exceptions) {
    const key = `${e.page}:${e.metric}`;
    if (
      !config.pages.some((p) => p.id === e.page) ||
      !Object.hasOwn(goals, e.metric) ||
      seen.has(key) ||
      !e.reason?.trim() ||
      !e.owner?.trim() ||
      !/^https:\/\//.test(e.issue || "") ||
      !/^\d{4}-\d{2}-\d{2}$/.test(e.expires || "") ||
      !Number.isFinite(Date.parse(e.expires)) ||
      new Date(e.expires).toISOString().slice(0, 10) !== e.expires ||
      e.expires < today ||
      !Number.isFinite(e.limit) ||
      e.limit < 0 ||
      (e.metric === "performance" && e.limit > 1)
    )
      errors.push(`Invalid or expired exception: ${key}`);
    seen.add(key);
  }
  if (
    measurements.length !== config.pages.length ||
    new Set(measurements.map((m) => m.id)).size !== config.pages.length
  )
    errors.push("Measurement matrix is incomplete");
  for (const page of config.pages) {
    const m = measurements.find((x) => x.id === page.id);
    if (!m) {
      errors.push(`${page.id}: missing measurement`);
      continue;
    }
    const limits = {
      ...goals,
      ...Object.fromEntries(
        ["scriptBytes", "imageBytes", "totalBytes"].map((k) => [
          k,
          ["max", page[k]],
        ]),
      ),
    };
    for (const [metric, [direction, goal]] of Object.entries(limits)) {
      const e = config.exceptions.find(
        (x) => x.page === page.id && x.metric === metric && x.expires >= today,
      );
      const limit = e?.limit ?? goal,
        invalid = !Number.isFinite(m[metric]);
      if (
        invalid ||
        (direction === "min" ? m[metric] < limit : m[metric] > limit)
      )
        errors.push(
          `${page.id}: ${metric}=${m[metric]} exceeds ${direction} ${limit}`,
        );
      else if (e && (direction === "min" ? m[metric] < goal : m[metric] > goal))
        warnings.push(
          `${page.id}: explicit ${metric} exception (${e.issue}, expires ${e.expires})`,
        );
    }
  }
  return { errors, warnings };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const config = loadConfig();
  const reports = readdirSync(".lighthouseci")
    .filter((n) => /^lhr-.*\.json$/.test(n))
    .map((n) => JSON.parse(readFileSync(`.lighthouseci/${n}`)));
  const measurements = summarize(reports, config);
  mkdirSync("var/quality", { recursive: true });
  writeFileSync(
    "var/quality/measurements.json",
    JSON.stringify(
      {
        measuredAt: new Date().toISOString(),
        node: process.version,
        platform: process.platform,
        architecture: process.arch,
        profile,
        measurements,
      },
      null,
      2,
    ) + "\n",
  );
  if (process.argv.includes("--measure-only"))
    console.log(JSON.stringify(measurements, null, 2));
  else {
    const result = evaluate(measurements, config);
    for (const w of result.warnings) console.warn(`WARNING ${w}`);
    for (const e of result.errors) console.error(`ERROR ${e}`);
    console.log(
      `Quality budgets: ${measurements.length} pages, ${result.errors.length} errors, ${result.warnings.length} warnings`,
    );
    if (result.errors.length) process.exitCode = 1;
  }
}
