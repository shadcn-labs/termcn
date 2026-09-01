import path from "path";

import { Command } from "commander";

import { FRAMEWORK_NAMES, type FrameworkName } from "@/src/config";
import { getTermcnRegistryIndex } from "@/src/registry/api";
import { TERMCN_URL } from "@/src/registry/constants";
import { getConfig } from "@/src/utils/get-config";
import { handleError } from "@/src/utils/handle-error";
import { highlighter } from "@/src/utils/highlighter";
import { logger } from "@/src/utils/logger";

const TERMCN_BASE_URL = "https://termcn.dev";

export const docs = new Command()
  .name("docs")
  .description("get docs, api references and usage examples for components")
  .argument("<components...>", "component names")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option(
    "-F, --framework <framework>",
    "the terminal framework to use: ink or opentui. defaults to the project framework."
  )
  .option("--json", "output as JSON.", false)
  .action(async (components, opts) => {
    try {
      const cwd = path.resolve(opts.cwd);
      const config = await getConfig(cwd);
      const framework = resolveDocsFramework(opts.framework, config?.style);

      const index = await getTermcnRegistryIndex();

      if (!index) {
        logger.error("Failed to fetch the registry index.");
        process.exit(1);
      }

      const results: {
        component: string;
        framework: FrameworkName;
        links: Record<string, string>;
      }[] = [];

      for (const component of components) {
        const item = index.find((entry) => entry.name === component);

        if (!item) {
          logger.error(
            `Component ${highlighter.info(
              component
            )} not found in the termcn registry.`
          );
          process.exit(1);
        }

        const links = (
          item.meta?.links as Record<string, Record<string, string>>
        )?.[framework];

        if (!links || Object.keys(links).length === 0) {
          logger.warn(
            `No documentation links available for ${highlighter.info(
              component
            )}.`
          );
          continue;
        }

        results.push({
          component,
          framework,
          links: normalizeLinks(links),
        });
      }

      if (opts.json) {
        console.log(JSON.stringify({ framework, results }, null, 2));
        return;
      }

      // Compute max key length across all results for consistent alignment.
      const maxKeyLength = Math.max(
        ...results.flatMap((r) => Object.keys(r.links).map((k) => k.length))
      );

      for (const { component, links } of results) {
        logger.log(highlighter.info(component));
        for (const [key, value] of Object.entries(links)) {
          logger.log(`  - ${key.padEnd(maxKeyLength + 2)}${value}`);
        }
        logger.break();
      }
    } catch (error) {
      handleError(error);
    }
  });

export function resolveDocsFramework(
  framework: unknown,
  style: string | undefined
) {
  const resolvedFramework = framework ?? style ?? "ink";

  if (!FRAMEWORK_NAMES.includes(resolvedFramework as FrameworkName)) {
    throw new Error(
      `Invalid framework: ${String(resolvedFramework)}. Expected one of: ${FRAMEWORK_NAMES.join(
        ", "
      )}.`
    );
  }

  return resolvedFramework as FrameworkName;
}

function normalizeLinks(links: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(links).map(([key, value]) => [
      key,
      value.startsWith(TERMCN_BASE_URL)
        ? `${TERMCN_URL}${value.slice(TERMCN_BASE_URL.length)}`
        : value,
    ])
  );
}
