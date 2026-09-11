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
      // Temporarily excluded while the registry github/resolver suites are
      // being repaired.
      "src/registry/github.test.ts",
      "src/registry/resolver.test.ts",
    ],
    testTimeout: 8000,
  },
});
