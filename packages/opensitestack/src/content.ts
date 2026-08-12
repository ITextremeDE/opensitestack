import type { ResolvedContent } from "./types";
import type { SiteRegistry } from "./registry";

export type ContentResolverOptions<T> = {
  readonly registry: SiteRegistry;
  readonly siteId: string;
  readonly contentArea: string;
  readonly readSite: (siteId: string) => Promise<T | null>;
  readonly readGroup: (groupId: string) => Promise<T | null>;
};

export async function resolveContent<T>({
  registry,
  siteId,
  contentArea,
  readSite,
  readGroup,
}: ContentResolverOptions<T>): Promise<ResolvedContent<T> | null> {
  const group = registry.getContentGroup(siteId, contentArea);

  const siteValue = await readSite(siteId);
  if (siteValue !== null) {
    return {
      value: siteValue,
      source: { kind: "site", id: siteId },
    };
  }

  if (!group) {
    return null;
  }

  const groupValue = await readGroup(group.id);

  return groupValue === null
    ? null
    : {
        value: groupValue,
        source: { kind: "group", id: group.id },
      };
}
