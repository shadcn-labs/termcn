import path from "path";

import { Command } from "commander";
import prompts from "prompts";
import { z } from "zod";

import { runInit } from "@/src/commands/init";
import { preFlightAdd } from "@/src/preflights/preflight-add";
import { getRegistryItems, getTermcnRegistryIndex } from "@/src/registry/api";
import { clearRegistryContext } from "@/src/registry/context";
import { isUniversalRegistryItem } from "@/src/registry/utils";
import { addComponents } from "@/src/utils/add-components";
import { dryRunComponents } from "@/src/utils/dry-run";
import { formatDryRunResult } from "@/src/utils/dry-run-formatter";
import { loadEnvFiles } from "@/src/utils/env-loader";
import * as ERRORS from "@/src/utils/errors";
import { createConfig, getConfig } from "@/src/utils/get-config";
import { handleError } from "@/src/utils/handle-error";
import { highlighter } from "@/src/utils/highlighter";
import { logger } from "@/src/utils/logger";
import { ensureRegistriesInConfig } from "@/src/utils/registries";
import { spinner } from "@/src/utils/spinner";

export const addOptionsSchema = z.object({
  components: z.array(z.string()).optional(),
  yes: z.boolean(),
  overwrite: z.boolean(),
  cwd: z.string(),
  all: z.boolean(),
  path: z.string().optional(),
  silent: z.boolean(),
  dryRun: z.boolean(),
  diff: z.union([z.string(), z.literal(true)]).optional(),
  view: z.union([z.string(), z.literal(true)]).optional(),
});

export const add = new Command()
  .name("add")
  .description("add a component to your project")
  .argument("[components...]", "item addresses to add")
  .option("-y, --yes", "skip confirmation prompt.", false)
  .option("-o, --overwrite", "overwrite existing files.", false)
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-a, --all", "add all available components", false)
  .option("-p, --path <path>", "the path to add the component to.")
  .option("-s, --silent", "mute output.", false)
  .option("--dry-run", "preview changes without writing files.", false)
  .option("--diff [path]", "show diff for a file.")
  .option("--view [path]", "show file contents.")
  .action(async (components, opts) => {
    try {
      const options = addOptionsSchema.parse({
        components,
        ...opts,
        cwd: path.resolve(opts.cwd),
      });

      await loadEnvFiles(options.cwd);

      const isDryRun = options.dryRun || options.diff || options.view;

      let initialConfig = await getConfig(options.cwd);
      if (!initialConfig) {
        initialConfig = createConfig({
          style: "ink",
          resolvedPaths: {
            cwd: options.cwd,
          },
        });
      }

      let hasNewRegistries = false;
      if (components.length > 0) {
        const { config: updatedConfig, newRegistries } =
          await ensureRegistriesInConfig(components, initialConfig, {
            silent: options.silent,
            writeFile: false,
          });
        initialConfig = updatedConfig;
        hasNewRegistries = newRegistries.length > 0;
      }

      if (options.components?.length) {
        const [registryItem] = await getRegistryItems([options.components[0]], {
          config: initialConfig,
        });

        if (isUniversalRegistryItem(registryItem) && !isDryRun) {
          await addComponents(options.components, initialConfig, options);
          return;
        }
      }

      if (!options.components?.length) {
        options.components = await promptForRegistryComponents(options);
      }

      const { errors, config: existingConfig } = await preFlightAdd(options);
      let config = existingConfig;

      if (
        errors[ERRORS.MISSING_CONFIG] ||
        errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT]
      ) {
        let proceed = options.yes;
        if (!proceed) {
          const answer = await prompts({
            type: "confirm",
            name: "proceed",
            message: `A termcn project is required to add components. Run ${highlighter.info(
              "termcn init"
            )} now?`,
            initial: true,
          });
          proceed = answer.proceed;
        }

        if (!proceed) {
          logger.break();
          process.exit(1);
        }

        config = await runInit({
          cwd: options.cwd,
          yes: options.yes,
          defaults: options.yes,
          silent: options.silent && !hasNewRegistries,
        });
      }

      if (!config) {
        throw new Error(
          `Failed to read config at ${highlighter.info(options.cwd)}.`
        );
      }

      const { config: updatedConfig } = await ensureRegistriesInConfig(
        options.components,
        config,
        {
          silent: options.silent || hasNewRegistries,
          writeFile: !isDryRun,
        }
      );
      config = updatedConfig;

      // Dry-run mode: preview changes without writing files.
      // --diff and --view imply --dry-run.
      if (isDryRun) {
        const dryRunSpinner = spinner("Resolving items.", {
          silent: options.silent,
        }).start();
        const dryRunResult = await dryRunComponents(
          options.components,
          config,
          {
            overwrite: options.overwrite,
          }
        );
        dryRunSpinner.stop();

        logger.log(
          formatDryRunResult(dryRunResult, options.components, {
            diff: options.diff,
            view: options.view,
          })
        );
        return;
      }

      await addComponents(options.components, config, options);
    } catch (error) {
      logger.break();
      handleError(error);
    } finally {
      clearRegistryContext();
    }
  });

async function promptForRegistryComponents(
  options: z.infer<typeof addOptionsSchema>
) {
  const registryIndex = await getTermcnRegistryIndex();
  if (!registryIndex) {
    logger.break();
    handleError(new Error("Failed to fetch registry index."));
    return [];
  }

  if (options.all) {
    return registryIndex.map((entry) => entry.name);
  }

  if (options.components?.length) {
    return options.components;
  }

  const { components } = await prompts({
    type: "multiselect",
    name: "components",
    message: "Which components would you like to add?",
    hint: "Space to select. A to toggle all. Enter to submit.",
    instructions: false,
    choices: registryIndex
      .filter((entry) => entry.type === "registry:ui")
      .map((entry) => ({
        title: entry.name,
        value: entry.name,
        selected: options.all ? true : options.components?.includes(entry.name),
      })),
  });

  if (!components?.length) {
    logger.warn("No components selected. Exiting.");
    logger.info("");
    process.exit(1);
  }

  const result = z.array(z.string()).safeParse(components);
  if (!result.success) {
    logger.error("");
    handleError(new Error("Something went wrong. Please try again."));
    return [];
  }
  return result.data;
}
