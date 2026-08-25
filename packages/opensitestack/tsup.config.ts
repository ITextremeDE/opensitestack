import { defineConfig } from "tsup";

export default defineConfig([
  {
    clean: true,
    dts: true,
    entry: {
      index: "src/index.ts",
      markdown: "src/markdown.ts",
      next: "src/next.ts",
      security: "src/security.ts",
    },
    format: ["esm"],
    sourcemap: true,
    splitting: false,
    treeshake: true,
  },
  {
    clean: false,
    dts: false,
    entry: { security: "src/security.ts" },
    format: ["cjs"],
    outExtension: () => ({ js: ".cjs" }),
    sourcemap: true,
    splitting: false,
    treeshake: true,
  },
]);
