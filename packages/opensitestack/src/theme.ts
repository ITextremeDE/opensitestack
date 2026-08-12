import { z } from "zod";

import type { SiteDefinition } from "./types";

const identifierSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const tokenValueSchema = z.union([
  z.string().trim().min(1),
  z.number().finite(),
]);

const themeSchema = z
  .object({
    id: identifierSchema,
    tokens: z.record(identifierSchema, tokenValueSchema).readonly(),
  })
  .strict()
  .refine((theme) => Object.keys(theme.tokens).length > 0, {
    path: ["tokens"],
    message: "Theme requires at least one design token",
  });

const themeRegistrySchema = z
  .object({
    themes: z.array(themeSchema).min(1).readonly(),
  })
  .strict();

export type DesignTokenValue = string | number;

export type ThemeDefinition = {
  readonly id: string;
  readonly tokens: Readonly<Record<string, DesignTokenValue>>;
};

export type ThemeRegistryDefinition = {
  readonly themes: readonly ThemeDefinition[];
};

export type ThemeStyle = Readonly<
  Record<`--${string}`, DesignTokenValue>
>;

export type ThemeRegistryErrorCode =
  | "INVALID_THEME_DEFINITION"
  | "DUPLICATE_THEME_ID"
  | "UNKNOWN_SITE_THEME";

export class ThemeRegistryError extends Error {
  constructor(
    readonly code: ThemeRegistryErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ThemeRegistryError";
  }
}

export class ThemeRegistry {
  readonly themes: readonly ThemeDefinition[];
  readonly #themesById: ReadonlyMap<string, ThemeDefinition>;

  constructor(
    definition: ThemeRegistryDefinition,
    sites: readonly SiteDefinition[] = [],
  ) {
    const result = themeRegistrySchema.safeParse(definition);
    if (!result.success) {
      throw new ThemeRegistryError(
        "INVALID_THEME_DEFINITION",
        `Invalid theme registry: ${z.prettifyError(result.error)}`,
        { cause: result.error },
      );
    }

    const themesById = new Map<string, ThemeDefinition>();
    for (const theme of result.data.themes) {
      if (themesById.has(theme.id)) {
        throw new ThemeRegistryError(
          "DUPLICATE_THEME_ID",
          `Duplicate theme id: ${theme.id}`,
        );
      }
      themesById.set(theme.id, theme);
    }

    for (const site of sites) {
      if (!themesById.has(site.theme)) {
        throw new ThemeRegistryError(
          "UNKNOWN_SITE_THEME",
          `Site ${site.id} references unknown theme ${site.theme}`,
        );
      }
    }

    this.themes = result.data.themes;
    this.#themesById = themesById;
  }

  getTheme(id: string): ThemeDefinition | null {
    return this.#themesById.get(id) ?? null;
  }

  getThemeForSite(site: SiteDefinition): ThemeDefinition {
    const theme = this.getTheme(site.theme);
    if (!theme) {
      throw new ThemeRegistryError(
        "UNKNOWN_SITE_THEME",
        `Site ${site.id} references unknown theme ${site.theme}`,
      );
    }
    return theme;
  }
}

export function defineThemeRegistry(
  definition: ThemeRegistryDefinition,
  sites: readonly SiteDefinition[] = [],
): ThemeRegistry {
  return new ThemeRegistry(definition, sites);
}

export function createThemeStyle(theme: ThemeDefinition): ThemeStyle {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(theme.tokens).map(([name, value]) => [`--${name}`, value]),
    ) as Record<`--${string}`, DesignTokenValue>,
  );
}
