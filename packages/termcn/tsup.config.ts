import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  clean: !options.watch,
  dts: true,
  entry: [
    "src/index.ts",
    "src/config/index.ts",
    "src/registry/index.ts",
    "src/schema/index.ts",
    "src/mcp/index.ts",
  ],
  format: ["esm"],
  sourcemap: false,
  minify: true,
  target: "esnext",
  outDir: "dist",
  treeshake: true,
  // Bundle @antfu/ni and its dependency tinyexec to avoid
  // module resolution failures with npx temporary installs.
  noExternal: ["@antfu/ni", "tinyexec"],
}));
