import { expect, test } from "@playwright/test";

for (const [host, name] of [["localhost", "Alpha"], ["beta.localhost", "Beta"]]) {
  test(`${name}: host-specific llms discovery`, async ({ request }) => {
    const result = await request.get("/llms.txt", { headers: { host } });
    expect(result.status()).toBe(200);
    expect(result.headers()["content-type"]).toContain("text/plain");
    const body = await result.text();
    expect(body).toContain(`# ${name}`);
    expect(body).not.toContain(`# ${name === "Alpha" ? "Beta" : "Alpha"}`);
    const home = await request.get("/", { headers: { host } });
    expect(await home.text()).toContain('rel="describedby" href="/llms.txt"');
  });
}

test("unknown hosts fail closed for llms discovery", async ({ request }) => {
  const result = await request.get("/llms.txt", { headers: { host: "unknown.invalid" } });
  expect(result.status()).toBe(404);
});
