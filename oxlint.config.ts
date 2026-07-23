import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, react, next, vitest],
  ignorePatterns: [
    "public/r/**",
    ".agents/**",
    ".cursor/**",
    ".changeset/**",
    ".claude/**",
    ".web-kits/**",
    "audio/**",
    "types/opentui-react.d.ts",
  ],
  overrides: [
    {
      files: [
        "registry/bases/ink/ui/**/*.tsx",
        "registry/bases/opentui/ui/**/*.tsx",
      ],
      rules: {
        complexity: "off",
        "func-style": "off",
        "jsx-a11y/aria-props": "off",
        "jsx-a11y/prefer-tag-over-role": "off",
        "jsx-a11y/role-has-required-aria-props": "off",
        "no-bitwise": "off",
        "no-negated-condition": "off",
        "no-nested-ternary": "off",
        "no-new-func": "off",
        "no-shadow": "off",
        "no-unused-vars": "off",
        "react/no-array-index-key": "off",
        "react/no-clone-element": "off",
        "react/no-react-children": "off",
        "react/no-set-state": "off",
        "react/no-unknown-property": "off",
        "react/style-prop-object": "off",
        "unicorn/no-nested-ternary": "off",
        "unicorn/number-literal-case": "off",
      },
    },
  ],
});
