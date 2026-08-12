import { readdir, readFile } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";

import matter from "gray-matter";

import type { ContentSourceAdapter, RawContentRecord } from "./content-source";

export type MarkdownContentSourceOptions = {
  readonly rootDirectory: string;
  readonly name?: string;
  readonly extensions?: readonly (".md" | ".mdx")[];
};

export function createMarkdownContentSource({
  rootDirectory,
  name = "markdown",
  extensions = [".md", ".mdx"],
}: MarkdownContentSourceOptions): ContentSourceAdapter {
  const root = resolve(rootDirectory);
  const allowedExtensions = new Set(extensions);

  return {
    name,
    async load() {
      const paths = await findContentFiles(root, allowedExtensions);
      return Promise.all(paths.map((path) => loadMarkdownRecord(root, path)));
    },
  };
}

async function findContentFiles(
  directory: string,
  extensions: ReadonlySet<string>,
): Promise<readonly string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths: string[] = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.isSymbolicLink()) {
      continue;
    }
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      paths.push(...(await findContentFiles(path, extensions)));
    } else if (entry.isFile() && extensions.has(extname(entry.name))) {
      paths.push(path);
    }
  }

  return paths;
}

async function loadMarkdownRecord(
  root: string,
  path: string,
): Promise<RawContentRecord> {
  const reference = relative(root, path).split(sep).join("/");
  if (!reference || reference.startsWith("../")) {
    throw new Error(`Content path escapes source root: ${path}`);
  }

  const source = await readFile(path, "utf8");
  const parsed = matter(source);
  return {
    reference,
    value: { ...parsed.data, body: parsed.content },
  };
}
