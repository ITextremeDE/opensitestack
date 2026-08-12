import { defineSiteRegistry, defineThemeRegistry } from "opensitestack";

export const siteRegistry = defineSiteRegistry({
  sites: [
    {
      id: "alpha",
      name: "Alpha Example",
      domain: "alpha.example",
      developmentHosts: ["localhost", "127.0.0.1", "[::1]"],
      canonicalOrigin: "https://alpha.example",
      metadata: {
        title: "Alpha Example",
        description: "Alpha uses the shared example-group content.",
        locale: "en",
      },
      contentAreas: {
        home: { groupId: "example-group" },
      },
      theme: "alpha",
    },
    {
      id: "beta",
      name: "Beta Example",
      domain: "beta.example",
      developmentHosts: ["beta.localhost"],
      canonicalOrigin: "https://beta.example",
      metadata: {
        title: "Beta Example",
        description: "Beta overrides the shared example-group content.",
        locale: "en",
      },
      contentAreas: {
        home: { groupId: "example-group" },
      },
      theme: "beta",
    },
  ],
  groups: [
    {
      id: "example-group",
      name: "Example Group",
      siteIds: ["alpha", "beta"],
    },
  ],
});

export const themeRegistry = defineThemeRegistry(
  {
    themes: [
      {
        id: "alpha",
        tokens: {
          "color-background": "#f4efe4",
          "color-surface": "#fffaf0",
          "color-text": "#18251f",
          "color-muted": "#657269",
          "color-accent": "#b34b2e",
          "font-body": "ui-serif, Georgia, serif",
          "font-display": "ui-serif, Georgia, serif",
          "content-width": "48rem",
          "page-space": "clamp(1.5rem, 6vw, 5rem)",
          "shape-radius": "0.25rem",
        },
      },
      {
        id: "beta",
        tokens: {
          "color-background": "#07111f",
          "color-surface": "#0d2034",
          "color-text": "#e7f7ff",
          "color-muted": "#8cb3c7",
          "color-accent": "#42e8c6",
          "font-body": "ui-monospace, SFMono-Regular, monospace",
          "font-display": "ui-sans-serif, system-ui, sans-serif",
          "content-width": "72rem",
          "page-space": "clamp(1rem, 4vw, 3rem)",
          "shape-radius": "1.5rem",
        },
      },
    ],
  },
  siteRegistry.sites,
);
