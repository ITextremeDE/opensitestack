import type { ContentSource, ResolvedContent } from "./types";
import type { SiteRegistry } from "./registry";

export type ContentResolverOptions<T> = {
  readonly registry: SiteRegistry;
  readonly siteId: string;
  readonly source: ContentSource;
  readonly readSite: (siteId: string) => Promise<T | null>;
  readonly readGroup: (groupId: string) => Promise<T | null>;
};

export async function resolveContent<T>({
  registry,
  siteId,
  source,
  readSite,
  readGroup,
}: ContentResolverOptions<T>): Promise<ResolvedContent<T> | null> {
  if (!registry.getSite(siteId)) {
    throw new Error(`Unknown site: ${siteId}`);
  }

  const siteValue = await readSite(siteId);
  if (siteValue !== null) {
    return {
      value: siteValue,
      source: { kind: "site", id: siteId },
    };
  }

  if (source.kind === "site") {
    if (source.id !== siteId) {
      throw new Error(
        `Site ${siteId} cannot inherit content from site ${source.id}`,
      );
    }
    return null;
  }

  registry.assertSiteInGroup(siteId, source.id);
  const groupValue = await readGroup(source.id);

  return groupValue === null
    ? null
    : {
        value: groupValue,
        source,
      };
}
