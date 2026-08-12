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
  .transform((value) => normalizeHost(value))
  .pipe(z.string().min(1));

const siteSchema = z
  .object({
    id: identifierSchema,
    name: z.string().trim().min(1),
    domain: hostSchema,
    developmentHosts: z.array(hostSchema).readonly().optional(),
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

  const firstHost = value.split(",", 1)[0]?.trim().toLowerCase();
  if (!firstHost) {
    return null;
  }

  if (firstHost.startsWith("[")) {
    const closingBracket = firstHost.indexOf("]");
    return closingBracket === -1
      ? firstHost
      : firstHost.slice(0, closingBracket + 1);
  }

  return firstHost.replace(/:\d+$/, "").replace(/\.$/, "");
}

export class SiteRegistry {
  readonly sites: readonly SiteDefinition[];
  readonly groups: readonly SiteGroupDefinition[];

  readonly #sitesById: ReadonlyMap<string, SiteDefinition>;
  readonly #sitesByHost: ReadonlyMap<string, SiteDefinition>;
  readonly #groupsById: ReadonlyMap<string, SiteGroupDefinition>;

  constructor(definition: SiteRegistryDefinition) {
    const parsed = registrySchema.parse(definition);
    const sitesById = new Map<string, SiteDefinition>();
    const sitesByHost = new Map<string, SiteDefinition>();

    for (const site of parsed.sites) {
      if (sitesById.has(site.id)) {
        throw new Error(`Duplicate site id: ${site.id}`);
      }
      sitesById.set(site.id, site);

      for (const host of [site.domain, ...(site.developmentHosts ?? [])]) {
        const existing = sitesByHost.get(host);
        if (existing) {
          throw new Error(
            `Host ${host} is assigned to both ${existing.id} and ${site.id}`,
          );
        }
        sitesByHost.set(host, site);
      }
    }

    const groupsById = new Map<string, SiteGroupDefinition>();
    for (const group of parsed.groups ?? []) {
      if (groupsById.has(group.id)) {
        throw new Error(`Duplicate site group id: ${group.id}`);
      }
      for (const siteId of group.siteIds) {
        if (!sitesById.has(siteId)) {
          throw new Error(`Group ${group.id} references unknown site ${siteId}`);
        }
      }
      if (new Set(group.siteIds).size !== group.siteIds.length) {
        throw new Error(`Group ${group.id} contains duplicate site ids`);
      }
      groupsById.set(group.id, group);
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

  assertSiteInGroup(siteId: string, groupId: string): void {
    const site = this.getSite(siteId);
    if (!site) {
      throw new Error(`Unknown site: ${siteId}`);
    }

    const group = this.getGroup(groupId);
    if (!group) {
      throw new Error(`Unknown site group: ${groupId}`);
    }

    if (!group.siteIds.includes(siteId)) {
      throw new Error(`Site ${siteId} is not a member of group ${groupId}`);
    }
  }
}

export function defineSiteRegistry(
  definition: SiteRegistryDefinition,
): SiteRegistry {
  return new SiteRegistry(definition);
}
