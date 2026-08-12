import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createMarkdownContentSource } from "../src/markdown";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true })),
  );
});

describe("createMarkdownContentSource", () => {
  it("loads Markdown and MDX recursively with normalized references", async () => {
    const root = await createTemporaryDirectory();
    await mkdir(join(root, "nested"));
    await writeFile(
      join(root, "welcome.md"),
      `---\nid: welcome\nslug: welcome\ntitle: Welcome\nsummary: Markdown example\nstatus: draft\n---\n# Welcome\n`,
    );
    await writeFile(
      join(root, "nested", "article.mdx"),
      `---\nid: article\nslug: article\ntitle: Article\nsummary: MDX example\nstatus: review\n---\n# Article\n\n<Component />\n`,
    );
    await writeFile(join(root, "ignored.txt"), "not content");

    const records = await createMarkdownContentSource({
      rootDirectory: root,
      name: "local-content",
    }).load();

    expect(records.map((record) => record.reference)).toEqual([
      "nested/article.mdx",
      "welcome.md",
    ]);
    expect(records[0]?.value).toMatchObject({
      id: "article",
      body: expect.stringContaining("<Component />"),
    });
  });

  it("does not follow symbolic links outside the source root", async () => {
    const root = await createTemporaryDirectory();
    const outside = await createTemporaryDirectory();
    await writeFile(join(outside, "outside.md"), "# Outside");
    await symlink(join(outside, "outside.md"), join(root, "outside.md"));

    await expect(
      createMarkdownContentSource({ rootDirectory: root }).load(),
    ).resolves.toEqual([]);
  });
});

async function createTemporaryDirectory(): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), "opensitestack-content-"));
  temporaryDirectories.push(path);
  return path;
}
