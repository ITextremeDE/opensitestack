import { access, readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markdownRoots = [
  join(repositoryRoot, "README.md"),
  join(repositoryRoot, "CHANGELOG.md"),
  join(repositoryRoot, "docs"),
  join(repositoryRoot, "examples/basic/README.md"),
  join(repositoryRoot, "packages/opensitestack/README.md"),
];

async function collectMarkdown(path) {
  const entries = await readdir(path, { withFileTypes: true }).catch(() => null);
  if (!entries) {
    return extname(path) === ".md" ? [path] : [];
  }

  const nested = await Promise.all(
    entries.map((entry) =>
      collectMarkdown(join(path, entry.name)),
    ),
  );
  return nested.flat();
}

function localLinkTargets(markdown) {
  return [...markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)]
    .map((match) => match[1].trim())
    .filter(
      (target) =>
        target &&
        !target.startsWith("#") &&
        !target.startsWith("http://") &&
        !target.startsWith("https://") &&
        !target.startsWith("mailto:"),
    )
    .map((target) => decodeURIComponent(target.split("#", 1)[0]));
}

const files = (await Promise.all(markdownRoots.map(collectMarkdown))).flat();
const failures = [];

for (const file of files) {
  const markdown = await readFile(file, "utf8");
  for (const target of localLinkTargets(markdown)) {
    const absoluteTarget = resolve(dirname(file), target);
    try {
      await access(absoluteTarget);
    } catch {
      failures.push(
        `${file.slice(repositoryRoot.length + 1)} -> ${target}`,
      );
    }
  }
}

if (failures.length > 0) {
  throw new Error(`Broken documentation links:\n${failures.join("\n")}`);
}

console.log(`Validated ${files.length} Markdown files.`);
