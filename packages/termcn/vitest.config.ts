import { fileURLToPath } from "node:url";

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    exclude: [
      ...configDefaults.exclude,
      "**/node_modules/**",
      "**/fixtures/**",
      // These suites exercise shadcn's web-framework init flow and hosted
      // /styles registry. The terminal-specific replacements are covered by
      // config, builder, build, and end-to-end scaffold checks.
      "src/commands/add.test.ts",
      "src/commands/init.test.ts",
      "src/registry/api.test.ts",
      "src/registry/fetcher.test.ts",
      "src/registry/github.test.ts",
      "src/registry/resolver.test.ts",
      "src/utils/get-config.test.ts",
      "src/utils/updaters/update-files.test.ts",
    ],
    testTimeout: 8000,
  },
});
