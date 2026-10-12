import { tegami } from "tegami";
import { createCli } from "tegami/cli";
import { github } from "tegami/plugins/github";

/**
 * Tegami release configuration for the termcn monorepo.
 *
 * Pending changelog entries live in `.tegami/*.md`; the publish lock lives at
 * `.tegami/publish-lock.yaml`. Run `pnpm tegami` for the interactive prompt,
 * `pnpm tegami version` / `pnpm tegami publish` locally, or `pnpm tegami ci`
 * from GitHub Actions on `main`.
 *
 * `termcn` is the only publishable package.
 */
const paper = tegami({
  packages: {
    termcn: {},
  },
  plugins: [
    github({
      repo: "shadcn-labs/termcn",
      versionPr: { base: "main" },
    }),
  ],
});

void createCli(paper).parseAsync();
