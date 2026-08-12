import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: "src/index.ts",
    markdown: "src/markdown.ts",
    next: "src/next.ts",
  },
  format: ["esm"],
  sourcemap: true,
  splitting: false,
  treeshake: true,
});
