import { readFileSync } from "node:fs";
export function validateConfig(config) {
  if (
    config.runs !== 3 ||
    !Number.isInteger(config.port) ||
    config.port < 1024 ||
    config.port > 65535
  )
    throw new Error("Exactly three runs and an unprivileged port are required");
  for (const [key, min, max] of [
    ["minimumPerformance", 0, 1],
    ["maximumLcpMs", 1, Infinity],
    ["maximumCls", 0, 1],
  ]) {
    if (!Number.isFinite(config[key]) || config[key] < min || config[key] > max)
      throw new Error(`Invalid ${key}`);
  }
  if (
    !Array.isArray(config.pages) ||
    !config.pages.length ||
    !Array.isArray(config.exceptions)
  )
    throw new Error("Pages and exceptions must be explicit arrays");
  const ids = new Set(),
    urls = new Set();
  for (const page of config.pages) {
    if (!/^[a-z0-9-]+$/.test(page.id) || ids.has(page.id))
      throw new Error("Duplicate or invalid page id");
    if (
      !/^(127\.0\.0\.1|localhost|[a-z0-9-]+(?:\.[a-z0-9-]+)*\.localhost)$/.test(
        page.host,
      )
    )
      throw new Error("Only synthetic loopback hosts are allowed");
    if (
      typeof page.path !== "string" ||
      !page.path.startsWith("/") ||
      page.path.startsWith("//") ||
      /[\\#]/.test(page.path)
    )
      throw new Error("Invalid local page path");
    const url = pageUrl(page, config);
    if (urls.has(url)) throw new Error("Duplicate page URL");
    ids.add(page.id);
    urls.add(url);
    for (const metric of ["scriptBytes", "imageBytes", "totalBytes"])
      if (!Number.isFinite(page[metric]) || page[metric] < 0)
        throw new Error(`Missing or invalid ${metric} budget`);
  }
  return config;
}
export function pageUrl(page, config) {
  return `http://${page.host}:${config.port}${page.path}`;
}
export function loadConfig() {
  return validateConfig(
    JSON.parse(
      readFileSync(
        process.env.OPENSITESTACK_QUALITY_CONFIG || "quality/config.json",
      ),
    ),
  );
}
