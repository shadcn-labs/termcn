import path from "path";

import { cosmiconfig } from "cosmiconfig";
import { loadConfig } from "tsconfig-paths";
import { z } from "zod";

import {
  BUILTIN_REGISTRIES,
  DEFAULT_FRAMEWORK,
} from "@/src/registry/constants";
import { ALIAS_KEYS, configSchema, rawConfigSchema } from "@/src/schema";
import type { AliasKey } from "@/src/schema";
import { highlighter } from "@/src/utils/highlighter";
import { resolveImport } from "@/src/utils/resolve-import";

export const CONFIG_FILE = "termcn.json";

export const explorer = cosmiconfig("termcn", {
  searchPlaces: [CONFIG_FILE],
});

export type Config = z.infer<typeof configSchema>;

/**
 * Default alias suffixes, relative to the `components` alias, used when an
 * optional alias is omitted from termcn.json.
 */
const ALIAS_FALLBACKS: Record<Exclude<AliasKey, "components">, string[]> = {
  ui: ["ui"],
  lib: ["..", "lib"],
  hooks: ["..", "hooks"],
  providers: ["..", "providers"],
  themes: ["..", "lib", "terminal-themes"],
};

export async function getConfig(cwd: string) {
  const config = await getRawConfig(cwd);

  if (!config) {
    return null;
  }

  return await resolveConfigPaths(cwd, config);
}

export async function resolveConfigPaths(
  cwd: string,
  config: z.infer<typeof rawConfigSchema>
) {
  // Built-in registries always win over user entries.
  config.registries = {
    ...BUILTIN_REGISTRIES,
    ...(config.registries || {}),
  };

  const tsConfig = await loadConfig(cwd);

  if (tsConfig.resultType === "failed") {
    throw new Error(
      `Failed to load tsconfig.json. ${tsConfig.message ?? ""}`.trim()
    );
  }

  const resolverConfig = { ...tsConfig, cwd };
  const components = resolveImport(config.aliases.components, resolverConfig);

  if (!components) {
    throw new Error(
      [
        `Could not resolve the ${highlighter.info("components")} alias ${highlighter.info(
          config.aliases.components
        )} in ${highlighter.info(cwd)}.`,
        `Configure matching path aliases in ${highlighter.info("tsconfig.json")} and try again.`,
      ].join("\n")
    );
  }

  const resolvedPaths: Record<AliasKey, string> = {
    components,
    ui: components,
    lib: components,
    hooks: components,
    providers: components,
    themes: components,
  };

  for (const key of ALIAS_KEYS) {
    if (key === "components") {
      continue;
    }

    const alias = config.aliases[key];
    const resolved = alias ? resolveImport(alias, resolverConfig) : null;

    resolvedPaths[key] =
      resolved ?? path.resolve(components, ...ALIAS_FALLBACKS[key]);
  }

  return configSchema.parse({
    ...config,
    resolvedPaths: { cwd, ...resolvedPaths },
  });
}

export async function getRawConfig(
  cwd: string
): Promise<z.infer<typeof rawConfigSchema> | null> {
  const configResult = await explorer.search(cwd);

  if (!configResult) {
    return null;
  }

  const parsed = rawConfigSchema.safeParse(configResult.config);

  if (!parsed.success) {
    throw new Error(
      [
        `Invalid configuration in ${highlighter.info(configResult.filepath)}:`,
        ...parsed.error.issues.map(
          (issue) => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`
        ),
      ].join("\n")
    );
  }

  for (const registryName of Object.keys(parsed.data.registries ?? {})) {
    if (registryName in BUILTIN_REGISTRIES) {
      throw new Error(
        `"${registryName}" is a built-in registry and cannot be overridden.`
      );
    }
  }

  return parsed.data;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Creates a config object with sensible defaults. Used by commands that can
 * operate before `termcn init` has written a config file.
 */
export function createConfig(partial?: DeepPartial<Config>): Config {
  const defaultConfig: Config = {
    framework: DEFAULT_FRAMEWORK,
    aliases: {
      components: "",
    },
    registries: {
      ...BUILTIN_REGISTRIES,
    },
    resolvedPaths: {
      cwd: process.cwd(),
      components: "",
      ui: "",
      lib: "",
      hooks: "",
      providers: "",
      themes: "",
    },
  };

  if (!partial) {
    return defaultConfig;
  }

  return {
    ...defaultConfig,
    ...partial,
    aliases: {
      ...defaultConfig.aliases,
      ...(partial.aliases || {}),
    },
    registries: {
      ...defaultConfig.registries,
      ...(partial.registries || {}),
    },
    resolvedPaths: {
      ...defaultConfig.resolvedPaths,
      ...(partial.resolvedPaths || {}),
    },
  };
}
