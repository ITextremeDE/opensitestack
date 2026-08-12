import type { ContentDocument } from "./content-schema";
import type { SiteDefinition } from "./types";

export type PublicationCandidate<T extends ContentDocument> = {
  readonly content: T;
  readonly pathname: string;
};

export type PublicationEntry<T extends ContentDocument> =
  PublicationCandidate<T> & {
    readonly siteId: string;
    readonly canonicalUrl: string;
  };

export type PublicationCollectionOptions<T extends ContentDocument> = {
  readonly site: SiteDefinition;
  readonly candidates: readonly PublicationCandidate<T>[];
  readonly now?: Date;
};

export function createCanonicalUrl(
  site: SiteDefinition,
  pathname: string,
): string {
  if (!pathname.startsWith("/") || pathname.startsWith("//")) {
    throw new TypeError(`Canonical pathname must start with one slash: ${pathname}`);
  }

  const canonicalUrl = new URL(pathname, site.canonicalOrigin);
  if (
    canonicalUrl.origin !== site.canonicalOrigin ||
    canonicalUrl.search ||
    canonicalUrl.hash
  ) {
    throw new TypeError(`Canonical pathname must stay on ${site.canonicalOrigin}`);
  }

  return canonicalUrl.href;
}

export function createPublicationEntries<T extends ContentDocument>({
  site,
  candidates,
  now = new Date(),
}: PublicationCollectionOptions<T>): readonly PublicationEntry<T>[] {
  const nowTime = now.getTime();
  if (Number.isNaN(nowTime)) {
    throw new TypeError("Publication time must be valid");
  }

  const entries: PublicationEntry<T>[] = [];
  const canonicalUrls = new Set<string>();

  for (const candidate of candidates) {
    const { content } = candidate;
    if (
      content.status !== "published" ||
      !content.indexable ||
      !content.publishedAt ||
      Date.parse(content.publishedAt) > nowTime
    ) {
      continue;
    }

    const canonicalUrl = createCanonicalUrl(site, candidate.pathname);
    if (canonicalUrls.has(canonicalUrl)) {
      throw new TypeError(`Duplicate publication URL: ${canonicalUrl}`);
    }
    canonicalUrls.add(canonicalUrl);
    entries.push({ ...candidate, siteId: site.id, canonicalUrl });
  }

  return entries;
}

export function projectPublicationEntries<
  T extends ContentDocument,
  Result,
>(
  entries: readonly PublicationEntry<T>[],
  project: (entry: PublicationEntry<T>) => Result,
): readonly Result[] {
  return entries.map(project);
}
