import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { once } from "node:events";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const cliRequire = createRequire(require.resolve("@lhci/cli/package.json"));
const nextRequire = createRequire(require.resolve("next/package.json"));
const postcssRequire = createRequire(nextRequire.resolve("postcss/package.json"));
const { SourceMapConsumer } = postcssRequire("source-map-js");

test("the resolved source-map parser rejects hostile indexed offsets", () => {
  const map = { version: 3, sources: ["input.css"], names: [], mappings: "AAAA" };
  const indexed = (offset) => ({ version: 3, sections: [{ offset, map }] });
  for (const offset of [{ line: 1e9, column: 0 }, { line: 0, column: Infinity }]) {
    assert.throws(() => new SourceMapConsumer(indexed(offset)));
  }
  const consumer = new SourceMapConsumer(indexed({ line: 0, column: 0 }));
  const mappings = [];
  consumer.eachMapping((mapping) => mappings.push(mapping));
  assert.deepEqual(mappings, [{
    source: "input.css", generatedLine: 1, generatedColumn: 0,
    originalLine: 1, originalColumn: 0, name: null,
  }]);
});

test("Lighthouse CI fetch supports its upgraded proxy agent and NO_PROXY", async () => {
  const server = createServer((_request, response) => response.end("local reference"));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const keys = ["HTTP_PROXY", "HTTPS_PROXY", "NO_PROXY", "http_proxy", "https_proxy", "no_proxy"];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  try {
    for (const key of keys) delete process.env[key];
    const fetch = cliRequire("./src/fetch.js");
    const url = `http://127.0.0.1:${server.address().port}/`;
    assert.equal(await (await fetch(url)).text(), "local reference");
    process.env.HTTP_PROXY = "http://127.0.0.1:1";
    process.env.NO_PROXY = "127.0.0.1";
    assert.equal(await (await fetch(url)).text(), "local reference");
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
