import { describe, expect, it } from "vitest";

import {
  createThemeStyle,
  defineThemeRegistry,
  type SiteDefinition,
} from "../src";

const site: SiteDefinition = {
  id: "alpha",
  name: "Alpha",
  domain: "alpha.example",
  canonicalOrigin: "https://alpha.example",
  metadata: {
    title: "Alpha",
    description: "Alpha site",
    locale: "en",
  },
  theme: "alpha",
};

describe("ThemeRegistry", () => {
  it("resolves a validated theme for each configured site", () => {
    const registry = defineThemeRegistry(
      {
        themes: [
          {
            id: "alpha",
            tokens: {
              "color-background": "#faf7f0",
              "content-width": "48rem",
              "space-page": 32,
            },
          },
        ],
      },
      [site],
    );

    expect(registry.getThemeForSite(site).id).toBe("alpha");
    expect(createThemeStyle(registry.getThemeForSite(site))).toEqual({
      "--color-background": "#faf7f0",
      "--content-width": "48rem",
      "--space-page": 32,
    });
  });

  it("rejects missing site themes during registry construction", () => {
    expect(() =>
      defineThemeRegistry(
        { themes: [{ id: "other", tokens: { color: "black" } }] },
        [site],
      ),
    ).toThrow(expect.objectContaining({ code: "UNKNOWN_SITE_THEME" }));
  });

  it("rejects duplicate theme ids", () => {
    expect(() =>
      defineThemeRegistry({
        themes: [
          { id: "alpha", tokens: { color: "black" } },
          { id: "alpha", tokens: { color: "white" } },
        ],
      }),
    ).toThrow(expect.objectContaining({ code: "DUPLICATE_THEME_ID" }));
  });

  it("rejects empty themes and unsafe token names", () => {
    for (const tokens of [{}, { "Color Name": "black" }] as const) {
      expect(() =>
        defineThemeRegistry({
          themes: [{ id: "alpha", tokens: tokens as never }],
        }),
      ).toThrow(expect.objectContaining({ code: "INVALID_THEME_DEFINITION" }));
    }
  });
});
