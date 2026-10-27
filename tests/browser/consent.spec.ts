import { expect, test } from "@playwright/test";
import { loadConfig } from "../../scripts/quality/config.mjs";
const config = loadConfig();
const storageKey = "opensitestack-consent-example";
for (const initiallyReady of [false, true]) {
  test(`consent lifecycle, manager ready before renderer: ${initiallyReady}`, async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on("request", (r) => {
      if (new URL(r.url()).hostname !== "127.0.0.1") requests.push(r.url());
    });
    const url = "/consent-example" + (initiallyReady ? "?ready=1" : "");
    await page.goto(url);
    const initialize = page.getByRole("button", {
      name: "Initialize manager",
      exact: true,
    });
    const settings = page.getByRole("button", {
      name: "Privacy settings",
      exact: true,
    });
    if (!initiallyReady) {
      await expect(settings).toBeDisabled();
      await expect(page.getByTestId("starts")).toHaveText("0");
      await initialize.click();
    }
    await expect(page.getByTestId("registrations")).toHaveText("1");
    await expect(page.getByTestId("starts")).toHaveText("0");
    await initialize.click();
    await expect(page.getByTestId("registrations")).toHaveText("1");
    await settings.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page
      .getByRole("button", { name: "Reject analytics", exact: true })
      .click();
    await expect(dialog).toBeHidden();
    await page.reload();
    if (!initiallyReady) await initialize.click();
    await expect(page.getByTestId("choice")).toHaveText("rejected");
    await expect(page.getByTestId("starts")).toHaveText("0");
    await settings.click();
    await page
      .getByRole("button", { name: "Allow analytics", exact: true })
      .click();
    await expect(page.getByTestId("starts")).toHaveText("1");
    await initialize.click();
    await expect(page.getByTestId("starts")).toHaveText("1");
    await expect(page.getByTestId("registrations")).toHaveText("1");
    await page.reload();
    if (!initiallyReady) await initialize.click();
    await expect(page.getByTestId("starts")).toHaveText("1");
    await page
      .getByRole("button", { name: "Revoke analytics", exact: true })
      .click();
    await initialize.click();
    await expect(page.getByTestId("starts")).toHaveText("1");
    await page.reload();
    if (!initiallyReady) await initialize.click();
    await expect(page.getByTestId("starts")).toHaveText("0");
    await expect(page.getByTestId("choice")).toHaveText("rejected");
    expect(requests).toEqual([]);
  });
}
test("dialog traps tab, closes with Escape and returns focus", async ({
  page,
}) => {
  await page.goto("/consent-example?ready=1");
  const settings = page.getByRole("button", {
    name: "Privacy settings",
    exact: true,
  });
  await settings.focus();
  await page.keyboard.press("Enter");
  const first = page.getByRole("button", {
      name: "Allow analytics",
      exact: true,
    }),
    last = page.getByRole("button", { name: "Close settings", exact: true });
  await first.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(last).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(settings).toBeFocused();
});
test("stale stored grants fail closed", async ({ page }) => {
  await page.addInitScript(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({ policyVersion: "old", choice: "granted" }),
      ),
    storageKey,
  );
  await page.goto("/consent-example?ready=1");
  await expect(page.getByTestId("registrations")).toHaveText("1");
  await expect(page.getByTestId("choice")).toHaveText("unknown");
  await expect(page.getByTestId("starts")).toHaveText("0");
});

test("dialog remains accessible on the second site and with larger text", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    `http://beta.localhost:${config.port}/consent-example?ready=1`,
  );
  await page
    .getByRole("button", { name: "Privacy settings", exact: true })
    .click();
  const result = await new AxeBuilder({ page })
    .include("dialog[open]")
    .analyze();
  expect(result.violations).toEqual([]);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await expect(
    page.getByRole("button", { name: "Allow analytics", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Reject analytics", exact: true }),
  ).toBeVisible();
});
