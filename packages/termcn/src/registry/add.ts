import path from "path";

import {
  clearRegistryContext,
  withRegistryContext,
} from "@/src/registry/context";
import { resolveRegistryTree } from "@/src/registry/resolver";
import type { RegistryResolvedItemsTree } from "@/src/schema";
import {
  addComponents,
  type AddComponentsOptions,
} from "@/src/utils/add-components";
import { createConfig, getConfig, type Config } from "@/src/utils/get-config";
import { ensureRegistriesInConfig } from "@/src/utils/registries";
import { getTargetAliasKey } from "@/src/utils/target-aliases";

export interface AddRegistryItemsOptions extends Pick<
  AddComponentsOptions,
  "overwrite" | "silent" | "path"
> {
  /** The project directory. Defaults to the current working directory. */
  cwd?: string;
}

/**
 * Resolve and install registry items into a project.
 *
 * This is the programmatic equivalent of `termcn add` for an existing project.
 * Universal registry items with explicit `~/` targets can also be installed
 * without a termcn.json file.
 */
export async function addRegistryItems(
  items: string[],
  options: AddRegistryItemsOptions = {}
): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const cwd = path.resolve(options.cwd ?? process.cwd());
  return withRegistryContext(async () => {
    try {
      const projectConfig = await getConfig(cwd);
      let config =
        projectConfig ??
        createConfig({
          framework: "ink",
          resolvedPaths: { cwd },
        });
      let resolvedTree: RegistryResolvedItemsTree | undefined;

      const { config: configWithRegistries } = await ensureRegistriesInConfig(
        items,
        config
      );
      config = configWithRegistries;

      if (!projectConfig) {
        const registryTree = await resolveRegistryTree(items, config, {
          useCache: true,
          requireUniversal: true,
        });
        if (!registryTree) {
          throw new Error("Failed to fetch components from registry.");
        }
        if (!hasResolvedTargetAliases(registryTree, config)) {
          throw new Error(
            "A termcn.json file is required to resolve target aliases."
          );
        }
        resolvedTree = registryTree;
      }

      await addComponents(items, config, {
        ...options,
        interactive: false,
        resolvedTree,
      });
    } finally {
      clearRegistryContext();
    }
  });
}

function hasResolvedTargetAliases(
  registryTree: RegistryResolvedItemsTree,
  config: Config
) {
  if (!registryTree) {
    return false;
  }

  return (registryTree.files ?? []).every((file) => {
    const aliasKey = getTargetAliasKey(file.target);

    return !aliasKey || Boolean(config.resolvedPaths[aliasKey]);
  });
}
