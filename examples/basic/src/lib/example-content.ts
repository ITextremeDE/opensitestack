import { join } from "node:path";

import { contentDocumentSchema, resolveContent, validateContentSource } from "opensitestack";
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
    source: { kind: "group", id: "example-group" },
    readSite: async (id) =>
      byReference.get(`sites/${id}/home.mdx`)?.body ?? null,
    readGroup: async (id) =>
      byReference.get(`groups/${id}/home.md`)?.body ?? null,
  });
}
