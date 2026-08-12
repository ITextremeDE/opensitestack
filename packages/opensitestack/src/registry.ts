import { z } from "zod";

import type {
  SiteDefinition,
  SiteGroupDefinition,
  SiteRegistryDefinition,
} from "./types";

const identifierSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const hostSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value, context) => {
    const host = normalizeHost(value);
    if (!host) {
      context.addIssue({ code: "custom", message: "Invalid host" });
      return z.NEVER;
    }
    return host;
  });

const metadataSchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    locale: z.string().trim().min(2).regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/),
  })
  .strict();

const contentInheritanceSchema = z
  .object({ groupId: identifierSchema })
  .strict();

const consentPurposeSchema = z.enum([
  "preferences",
  "analytics",
  "marketing",
]);

const adapterReferenceSchema = z.object({ adapterId: identifierSchema }).strict();

const integrationsSchema = z
  .object({
    consent: z
      .object({
        adapterId: identifierSchema,
        policyVersion: z.string().trim().min(1),
        purposes: z.array(consentPurposeSchema).min(1).readonly(),
      })
      .strict()
      .optional(),
    analytics: z
      .object({
        adapterId: identifierSchema,
        consentPurpose: consentPurposeSchema,
      })
      .strict()
      .optional(),
    forms: z
      .record(identifierSchema, adapterReferenceSchema)
      .readonly()
      .optional(),
  })
  .strict()
  .superRefine((integrations, context) => {
    const consent = integrations.consent;
    if (consent && new Set(consent.purposes).size !== consent.purposes.length) {
      context.addIssue({
        code: "custom",
        path: ["consent", "purposes"],
        message: "Consent purposes must be unique",
      });
    }

    const analytics = integrations.analytics;
    if (!analytics) {
      return;
    }
    if (!consent) {
      context.addIssue({
        code: "custom",
        path: ["analytics"],
        message: "Analytics requires consent configuration",
      });
    } else if (!consent.purposes.includes(analytics.consentPurpose)) {
      context.addIssue({
        code: "custom",
        path: ["analytics", "consentPurpose"],
        message: "Analytics consent purpose must be declared by consent configuration",
      });
    }
  });

const siteSchema = z
  .object({
    id: identifierSchema,
    name: z.string().trim().min(1),
    domain: hostSchema,
    developmentHosts: z.array(hostSchema).readonly().optional(),
    canonicalOrigin: z.url().trim(),
    metadata: metadataSchema,
    contentAreas: z
      .record(identifierSchema, contentInheritanceSchema)
      .readonly()
      .optional(),
    integrations: integrationsSchema.optional(),
    theme: identifierSchema,
  })
  .strict();

const groupSchema = z
  .object({
    id: identifierSchema,
    name: z.string().trim().min(1),
    siteIds: z.array(identifierSchema).min(1).readonly(),
  })
  .strict();

const registrySchema = z
  .object({
    sites: z.array(siteSchema).min(1).readonly(),
    groups: z.array(groupSchema).readonly().optional(),
  })
  .strict();

export function normalizeHost(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const rawHost = value.trim().toLowerCase();
  if (!rawHost || rawHost.includes(",")) {
    return null;
  }

  try {
    const parsed = new URL(`http://${rawHost}`);
    if (
      parsed.username ||
      parsed.password ||
      parsed.pathname !== "/" ||
      parsed.search ||
      parsed.hash
    ) {
      return null;
    }
    return parsed.hostname.replace(/\.$/, "");
  } catch {
    return null;
  }
}

export type SiteRegistryErrorCode =
  | "INVALID_DEFINITION"
  | "DUPLICATE_SITE_ID"
  | "DUPLICATE_HOST"
  | "INVALID_CANONICAL_ORIGIN"
  | "DUPLICATE_GROUP_ID"
  | "UNKNOWN_GROUP_SITE"
  | "DUPLICATE_GROUP_SITE"
  | "UNKNOWN_CONTENT_GROUP"
  | "CONTENT_GROUP_MEMBERSHIP"
  | "UNKNOWN_SITE"
  | "UNKNOWN_GROUP";

export class SiteRegistryError extends Error {
  constructor(
    readonly code: SiteRegistryErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "SiteRegistryError";
  }
}

export class SiteRegistry {
  readonly sites: readonly SiteDefinition[];
  readonly groups: readonly SiteGroupDefinition[];

  readonly #sitesById: ReadonlyMap<string, SiteDefinition>;
  readonly #sitesByHost: ReadonlyMap<string, SiteDefinition>;
  readonly #groupsById: ReadonlyMap<string, SiteGroupDefinition>;

  constructor(definition: SiteRegistryDefinition) {
    const result = registrySchema.safeParse(definition);
    if (!result.success) {
      throw new SiteRegistryError(
        "INVALID_DEFINITION",
        `Invalid site registry: ${z.prettifyError(result.error)}`,
        { cause: result.error },
      );
    }
    const parsed = result.data;
    const sitesById = new Map<string, SiteDefinition>();
    const sitesByHost = new Map<string, SiteDefinition>();

    for (const site of parsed.sites) {
      if (sitesById.has(site.id)) {
        throw new SiteRegistryError(
          "DUPLICATE_SITE_ID",
          `Duplicate site id: ${site.id}`,
        );
      }

      const canonicalUrl = new URL(site.canonicalOrigin);
      const canonicalHost = normalizeHost(canonicalUrl.host);
      if (
        canonicalUrl.protocol !== "https:" ||
        canonicalUrl.username ||
        canonicalUrl.password ||
        canonicalUrl.port ||
        canonicalUrl.pathname !== "/" ||
        canonicalUrl.search ||
        canonicalUrl.hash ||
        canonicalHost !== site.domain
      ) {
        throw new SiteRegistryError(
          "INVALID_CANONICAL_ORIGIN",
          `Canonical origin for ${site.id} must be the HTTPS origin of ${site.domain}`,
        );
      }
      sitesById.set(site.id, site);

      for (const host of [site.domain, ...(site.developmentHosts ?? [])]) {
        const existing = sitesByHost.get(host);
        if (existing) {
          throw new SiteRegistryError(
            "DUPLICATE_HOST",
            `Host ${host} is assigned to both ${existing.id} and ${site.id}`,
          );
        }
        sitesByHost.set(host, site);
      }
    }

    const groupsById = new Map<string, SiteGroupDefinition>();
    for (const group of parsed.groups ?? []) {
      if (groupsById.has(group.id)) {
        throw new SiteRegistryError(
          "DUPLICATE_GROUP_ID",
          `Duplicate site group id: ${group.id}`,
        );
      }
      for (const siteId of group.siteIds) {
        if (!sitesById.has(siteId)) {
          throw new SiteRegistryError(
            "UNKNOWN_GROUP_SITE",
            `Group ${group.id} references unknown site ${siteId}`,
          );
        }
      }
      if (new Set(group.siteIds).size !== group.siteIds.length) {
        throw new SiteRegistryError(
          "DUPLICATE_GROUP_SITE",
          `Group ${group.id} contains duplicate site ids`,
        );
      }
      groupsById.set(group.id, group);
    }

    for (const site of parsed.sites) {
      for (const [areaId, inheritance] of Object.entries(
        site.contentAreas ?? {},
      )) {
        const group = groupsById.get(inheritance.groupId);
        if (!group) {
          throw new SiteRegistryError(
            "UNKNOWN_CONTENT_GROUP",
            `Content area ${areaId} for site ${site.id} references unknown group ${inheritance.groupId}`,
          );
        }
        if (!group.siteIds.includes(site.id)) {
          throw new SiteRegistryError(
            "CONTENT_GROUP_MEMBERSHIP",
            `Site ${site.id} cannot use group ${group.id} for content area ${areaId} without membership`,
          );
        }
      }
    }

    this.sites = parsed.sites;
    this.groups = parsed.groups ?? [];
    this.#sitesById = sitesById;
    this.#sitesByHost = sitesByHost;
    this.#groupsById = groupsById;
  }

  getSite(id: string): SiteDefinition | null {
    return this.#sitesById.get(id) ?? null;
  }

  getSiteByHost(host: string | null | undefined): SiteDefinition | null {
    const normalizedHost = normalizeHost(host);
    return normalizedHost ? (this.#sitesByHost.get(normalizedHost) ?? null) : null;
  }

  getGroup(id: string): SiteGroupDefinition | null {
    return this.#groupsById.get(id) ?? null;
  }

  getContentGroup(siteId: string, areaId: string): SiteGroupDefinition | null {
    const site = this.getSite(siteId);
    if (!site) {
      throw new SiteRegistryError("UNKNOWN_SITE", `Unknown site: ${siteId}`);
    }

    const inheritance = site.contentAreas?.[areaId];
    return inheritance ? this.getGroup(inheritance.groupId) : null;
  }

  assertSiteInGroup(siteId: string, groupId: string): void {
    const site = this.getSite(siteId);
    if (!site) {
      throw new SiteRegistryError("UNKNOWN_SITE", `Unknown site: ${siteId}`);
    }

    const group = this.getGroup(groupId);
    if (!group) {
      throw new SiteRegistryError(
        "UNKNOWN_GROUP",
        `Unknown site group: ${groupId}`,
      );
    }

    if (!group.siteIds.includes(siteId)) {
      throw new SiteRegistryError(
        "CONTENT_GROUP_MEMBERSHIP",
        `Site ${siteId} is not a member of group ${groupId}`,
      );
    }
  }
}

export function defineSiteRegistry(
  definition: SiteRegistryDefinition,
): SiteRegistry {
  return new SiteRegistry(definition);
}
