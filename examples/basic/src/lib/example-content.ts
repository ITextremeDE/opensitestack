import { join } from "node:path";

import {
  contentDocumentSchema,
  createPublicationEntries,
  resolveContent,
  validateContentSource,
} from "opensitestack";
import { createMarkdownContentSource } from "opensitestack/markdown";

import { siteRegistry } from "@/config/sites";

const contentSource = createMarkdownContentSource({
  rootDirectory: join(process.cwd(), "content"),
  name: "example-markdown",
});

export async function getExampleContent(siteId: string) {
  const records = await validateContentSource(
    contentSource,
    contentDocumentSchema,
  );
  const byReference = new Map(
    records.map((record) => [record.source.reference, record.value]),
  );

  return resolveContent({
    registry: siteRegistry,
    siteId,
    contentArea: "home",
    readSite: async (id) =>
      byReference.get(`sites/${id}/home.mdx`) ?? null,
    readGroup: async (id) =>
      byReference.get(`groups/${id}/home.md`) ?? null,
  });
}

export async function getExamplePublicationEntries(siteId: string) {
  const site = siteRegistry.getSite(siteId);
  if (!site) {
    return [];
  }

  const content = await getExampleContent(siteId);
  return createPublicationEntries({
    site,
    candidates: content ? [{ content: content.value, pathname: "/" }] : [],
  });
}
