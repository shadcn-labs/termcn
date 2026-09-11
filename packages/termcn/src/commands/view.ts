import path from "path";

import { Command } from "commander";
import { z } from "zod";

import { getRegistryItems } from "@/src/registry/api";
import { configWithDefaults } from "@/src/registry/config";
import { clearRegistryContext } from "@/src/registry/context";
import { validateRegistryConfigForItems } from "@/src/registry/validator";
import { createConfig, getConfig } from "@/src/utils/get-config";
import { handleError } from "@/src/utils/handle-error";
import { ensureRegistriesInConfig } from "@/src/utils/registries";

const viewOptionsSchema = z.object({
  cwd: z.string(),
});

export const view = new Command()
  .name("view")
  .description("view items from the registry")
  .argument("<items...>", "item addresses to view")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .action(async (items: string[], opts) => {
    try {
      const options = viewOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
      });

      const projectConfig = await getConfig(options.cwd);
      const config = configWithDefaults(
        projectConfig ??
          createConfig({
            framework: "ink",
            resolvedPaths: { cwd: options.cwd },
          })
      );
      await ensureRegistriesInConfig(items, config);

      // Validate registries early for better error messages.
      validateRegistryConfigForItems(items, config);

      const payload = await getRegistryItems(items, { config });
      console.log(JSON.stringify(payload, null, 2));
      process.exit(0);
    } catch (error) {
      handleError(error);
    } finally {
      clearRegistryContext();
    }
  });
