import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { loadConfig, pageUrl } from "../../scripts/quality/config.mjs";
const config = loadConfig();
for (const pageConfig of config.pages) {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    test(`${pageConfig.id}: axe ${viewport.width}`, async ({ page }, info) => {
      await page.setViewportSize(viewport);
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const response = await page.goto(pageUrl(pageConfig, config));
      expect(response?.status()).toBe(200);
      await expect(page.locator("main")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(async () => {
        for (
          let y = 0;
          y < document.documentElement.scrollHeight;
          y += innerHeight
        ) {
          scrollTo(0, y);
          await new Promise(requestAnimationFrame);
        }
        scrollTo(0, 0);
        await Promise.all(
          document
            .getAnimations()
            .filter(
              (a) => a.effect?.getComputedTiming().iterations !== Infinity,
            )
            .map((a) => a.finished.catch(() => {})),
        );
      });
      const result = await new AxeBuilder({ page }).analyze();
      await info.attach("axe", {
        body: JSON.stringify(result.violations, null, 2),
        contentType: "application/json",
      });
      expect(result.violations).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
  test(`${pageConfig.id}: 320px reflow`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(pageUrl(pageConfig, config));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  });
}
