import path from "path";

import { Command } from "commander";
import fsExtra from "fs-extra";
import { z } from "zod";

import { configWithDefaults } from "@/src/registry/config";
import { clearRegistryContext } from "@/src/registry/context";
import {
  findUnknownSearchTypes,
  printSearchResults,
  resolveSearchRegistries,
  SEARCHABLE_TYPES,
  searchRegistries,
} from "@/src/registry/search";
import { validateRegistryConfigForItems } from "@/src/registry/validator";
import { CONFIG_FILE, createConfig, getConfig } from "@/src/utils/get-config";
import { handleError } from "@/src/utils/handle-error";
import { highlighter } from "@/src/utils/highlighter";
import { logger } from "@/src/utils/logger";
import { ensureRegistriesInConfig } from "@/src/utils/registries";

const searchOptionsSchema = z.object({
  cwd: z.string(),
  query: z.string().optional(),
  types: z.array(z.string()).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export const search = new Command()
  .name("search")
  .alias("list")
  .description("search items from registries")
  .argument(
    "[registries...]",
    "registry namespaces or URLs to search. When omitted, searches registries configured in termcn.json."
  )
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-q, --query <query>", "query string")
  .option(
    "-t, --type <type>",
    "filter by item type, e.g. ui, block, hook. Comma-separated for multiple."
  )
  .option("-l, --limit <number>", "maximum number of items to display", "100")
  .option("-o, --offset <number>", "number of items to skip", "0")
  .option("--json", "output as JSON.", false)
  .action(async (registries: string[], opts) => {
    try {
      const options = searchOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        query: opts.query,
        types: opts.type
          ? opts.type
              .split(",")
              .map((type: string) => type.trim())
              .filter(Boolean)
          : undefined,
        limit: opts.limit ? parseInt(opts.limit, 10) : undefined,
        offset: opts.offset ? parseInt(opts.offset, 10) : undefined,
      });

      // Validate type filters up front so an unknown type fails clearly
      // instead of silently returning no results.
      if (options.types?.length) {
        const unknownTypes = findUnknownSearchTypes(options.types);
        if (unknownTypes.length > 0) {
          logger.break();
          logger.error(
            `Unknown ${unknownTypes.length === 1 ? "type" : "types"}: ${unknownTypes
              .map((type) => highlighter.info(type))
              .join(", ")}.`
          );
          logger.error(`Valid types: ${SEARCHABLE_TYPES.join(", ")}.`);
          logger.break();
          process.exit(1);
        }
      }

      const defaultConfig = configWithDefaults(
        createConfig({
          framework: "ink",
          resolvedPaths: { cwd: options.cwd },
        })
      );
      const configPath = path.resolve(options.cwd, CONFIG_FILE);
      const hasConfig = fsExtra.existsSync(configPath);
      const projectConfig = hasConfig ? await getConfig(options.cwd) : null;
      const config = projectConfig
        ? configWithDefaults(projectConfig)
        : defaultConfig;

      // Searching every configured registry requires termcn.json; explicit
      // namespaces and URLs work before init.
      const searchAllConfigured = registries.length === 0;
      if (searchAllConfigured && !hasConfig) {
        logger.break();
        logger.error(
          `Provide a registry or namespace to search, e.g. ${highlighter.info(
            "termcn search @termcn"
          )}.`
        );
        logger.break();
        logger.error(
          `With ${highlighter.info(CONFIG_FILE)}, run ${highlighter.info(
            "termcn search"
          )} without arguments to search configured third-party registries.`
        );
        logger.break();
        process.exit(1);
      }

      await ensureRegistriesInConfig(
        registries
          .filter((registry) => registry.startsWith("@"))
          .map((registry) => `${registry}/registry`),
        config
      );

      // When no registry is passed, "search all" resolves to every configured
      // registry, excluding builtins (e.g. @termcn).
      const registriesToSearch = resolveSearchRegistries(registries, config);

      if (searchAllConfigured && registriesToSearch.length === 0) {
        logger.break();
        logger.error(
          `No third-party registries are configured in ${highlighter.info(
            CONFIG_FILE
          )}.`
        );
        logger.error(
          `Provide a registry or namespace to search, e.g. ${highlighter.info(
            "termcn search @termcn"
          )}.`
        );
        logger.break();
        process.exit(1);
      }

      // For explicitly requested registries we validate up front so the user
      // gets a clear error (e.g. missing env vars). When searching every
      // configured registry we skip strict validation and instead tolerate
      // individual registry failures (see continueOnError below).
      if (!searchAllConfigured) {
        validateRegistryConfigForItems(registriesToSearch, config);
      }

      const results = await searchRegistries(registriesToSearch, {
        query: options.query,
        types: options.types,
        limit: options.limit,
        offset: options.offset,
        config,
        // Tolerate per-registry failures when searching every configured
        // registry; failures are returned in `results.errors` so they can be
        // surfaced to humans (printSearchResults) and machines (--json) alike.
        continueOnError: searchAllConfigured,
      });

      // In search-all mode, failures are tolerated and collected. If *every*
      // registry failed, the search did not succeed — exit non-zero.
      const allRegistriesFailed =
        searchAllConfigured &&
        results.errors?.length === registriesToSearch.length;

      if (opts.json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        printSearchResults(results, {
          query: options.query,
          types: options.types,
          registries: registriesToSearch,
        });
      }

      process.exit(allRegistriesFailed ? 1 : 0);
    } catch (error) {
      handleError(error);
    } finally {
      clearRegistryContext();
    }
  });
