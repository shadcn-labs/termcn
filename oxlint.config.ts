import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, react, next, vitest],
  ignorePatterns: [
    "apps/web/public/r/**",
    ".agents/**",
    ".cursor/**",
    ".changeset/**",
    ".claude/**",
    "apps/web/.web-kits/**",
    "apps/web/audio/**",
    "apps/web/types/opentui-react.d.ts",
    "packages/termcn/**",
  ],
  overrides: [
    {
      files: [
        "apps/web/registry/bases/ink/ui/**/*.tsx",
        "apps/web/registry/bases/opentui/ui/**/*.tsx",
      ],
      rules: {
        complexity: "off",
        "func-style": "off",
        "jsx-a11y/aria-props": "off",
        "no-bitwise": "off",
        "no-negated-condition": "off",
        "no-nested-ternary": "off",
        "no-new-func": "off",
        "no-shadow": "off",
        "no-unused-vars": "off",
        "unicorn/no-nested-ternary": "off",
        "unicorn/number-literal-case": "off",
      },
    },
  ],
});
