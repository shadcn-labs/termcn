import { z } from "zod";

import { resolveGitHubRegistrySource } from "@/src/registry/address";
import { buildUrlAndHeadersForRegistryItem } from "@/src/registry/builder";
import { configWithDefaults } from "@/src/registry/config";
import { BUILTIN_REGISTRIES, REGISTRY_URL } from "@/src/registry/constants";
import {
  setRegistryHeaders,
  withRegistryContext,
} from "@/src/registry/context";
import {
  ConfigParseError,
  RegistriesIndexParseError,
  RegistryInvalidNamespaceError,
  RegistryNotFoundError,
  RegistryParseError,
  RegistryValidationError,
} from "@/src/registry/errors";
import { fetchRegistry } from "@/src/registry/fetcher";
import { fetchGitHubRegistryCatalog } from "@/src/registry/github";
import {
  fetchRegistryItems,
  resolveRegistryTree,
} from "@/src/registry/resolver";
import { isUrl } from "@/src/registry/utils";
import {
  registriesSchema,
  registryConfigSchema,
  registryIndexSchema,
  registryItemSchema,
  registrySchema,
} from "@/src/schema";
import { Config, explorer } from "@/src/utils/get-config";

type RegistryApiOptions = {
  config?: Partial<Config>;
  useCache?: boolean;
};

export async function getRegistry(name: string, options?: RegistryApiOptions) {
  return withRegistryContext(() => getRegistryWithContext(name, options));
}

async function getRegistryWithContext(
  name: string,
  options?: RegistryApiOptions
) {
  const { config, useCache } = options || {};

  if (isUrl(name)) {
    const [result] = await fetchRegistry([name], { useCache });
    return parseRegistryCatalog(name, result);
  }

  const githubSource = resolveGitHubRegistrySource(name);
  if (githubSource) {
    return fetchGitHubRegistryCatalog(githubSource, { useCache });
  }

  if (!name.startsWith("@")) {
    throw new RegistryInvalidNamespaceError(name);
  }

  let registryName = name;
  if (!registryName.endsWith("/registry")) {
    registryName = `${registryName}/registry`;
  }

  const urlAndHeaders = buildUrlAndHeadersForRegistryItem(
    registryName as `@${string}`,
    configWithDefaults(config)
  );

  if (!urlAndHeaders?.url) {
    throw new RegistryNotFoundError(registryName);
  }

  if (urlAndHeaders.headers && Object.keys(urlAndHeaders.headers).length > 0) {
    setRegistryHeaders({
      [urlAndHeaders.url]: urlAndHeaders.headers,
    });
  }

  const [result] = await fetchRegistry([urlAndHeaders.url], { useCache });

  return parseRegistryCatalog(registryName, result);
}

function parseRegistryCatalog(name: string, result: unknown) {
  try {
    const registry = registrySchema.parse(result);

    if (registry.include?.length) {
      throw new RegistryValidationError(
        `Registry catalog "${name}" uses "include", but consumer registry endpoints must serve a resolved registry catalog. Run "npx termcn build" and serve the built registry.json, or use loadRegistry() in a dynamic route.`,
        {
          context: {
            registry: name,
            include: registry.include,
          },
          suggestion:
            "Serve a flattened registry.json for CLI consumers. Source registry.json files with include are supported by termcn build and loadRegistry().",
        }
      );
    }

    return registry;
  } catch (error) {
    if (error instanceof RegistryValidationError) {
      throw error;
    }

    throw new RegistryParseError(name, error, {
      subject: "registry catalog",
      suggestion:
        "The registry catalog may be corrupted or have an invalid format. Please make sure it returns a valid registry.json object. See https://termcn.dev/schema/registry.json.",
    });
  }
}

export async function getRegistryItems(
  items: string[],
  options?: RegistryApiOptions
) {
  const { config, useCache = false } = options || {};

  return withRegistryContext(() =>
    fetchRegistryItems(items, configWithDefaults(config), { useCache })
  );
}

export async function resolveRegistryItems(
  items: string[],
  options?: RegistryApiOptions
) {
  const { config, useCache = false } = options || {};

  return withRegistryContext(() =>
    resolveRegistryTree(items, configWithDefaults(config), { useCache })
  );
}

export async function getRegistriesConfig(
  cwd: string,
  options?: { useCache?: boolean }
) {
  const { useCache = true } = options || {};

  // Clear cache if requested
  if (!useCache) {
    explorer.clearCaches();
  }

  const configResult = await explorer.search(cwd);

  if (!configResult) {
    // Do not throw an error if the config is missing.
    // We still have access to the built-in registries.
    return {
      registries: BUILTIN_REGISTRIES,
    };
  }

  // Parse just the registries field from the config
  const registriesConfig = z
    .object({
      registries: registryConfigSchema.optional(),
    })
    .safeParse(configResult.config);

  if (!registriesConfig.success) {
    throw new ConfigParseError(cwd, registriesConfig.error);
  }

  // Merge built-in registries with user registries
  return {
    registries: {
      ...BUILTIN_REGISTRIES,
      ...(registriesConfig.data.registries || {}),
    },
  };
}

export async function getTermcnRegistryIndex() {
  const [result] = await fetchRegistry(["index.json"]);

  return registryIndexSchema.parse(result);
}

// Fetch registries with new schema (array of objects with name, homepage, url, featured).
export async function getRegistries(options?: { useCache?: boolean }) {
  options = {
    useCache: true,
    ...options,
  };

  const url = `${REGISTRY_URL}/registries.json`;
  const [data] = await fetchRegistry([url], {
    useCache: options.useCache,
  });

  try {
    return registriesSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new RegistriesIndexParseError(error);
    }

    throw error;
  }
}
