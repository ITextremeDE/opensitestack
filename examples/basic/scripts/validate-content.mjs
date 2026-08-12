import { join } from "node:path";

import { contentDocumentSchema, validateContentSource } from "opensitestack";
import { createMarkdownContentSource } from "opensitestack/markdown";

const records = await validateContentSource(
  createMarkdownContentSource({
    rootDirectory: join(process.cwd(), "content"),
    name: "example-markdown",
  }),
  contentDocumentSchema,
);

if (records.length === 0) {
  throw new Error("Example content source is empty");
}

console.log(`${records.length} content documents validated`);
