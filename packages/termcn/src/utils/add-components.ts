import { z } from "zod";

import { configWithDefaults } from "@/src/registry/config";
import { resolveRegistryTree } from "@/src/registry/resolver";
import { registryItemFileSchema } from "@/src/schema";
import type { RegistryResolvedItemsTree } from "@/src/schema";
import type { Config } from "@/src/utils/get-config";
import { isSafeTarget } from "@/src/utils/is-safe-target";
import { logger } from "@/src/utils/logger";
import { updateDependencies } from "@/src/utils/updaters/update-dependencies";
import { updateFiles } from "@/src/utils/updaters/update-files";

export interface AddComponentsOptions {
  overwrite?: boolean;
  silent?: boolean;
  interactive?: boolean;
  resolvedTree?: RegistryResolvedItemsTree;
  path?: string;
}

export async function addComponents(
  components: string[],
  config: Config,
  options: AddComponentsOptions = {}
) {
  if (components.length === 0) {
    return;
  }

  const settings = {
    overwrite: false,
    silent: false,
    interactive: true,
    ...options,
  };
  const tree =
    settings.resolvedTree ??
    (await resolveRegistryTree(components, configWithDefaults(config)));

  if (!tree) {
    throw new Error("Failed to fetch components from registry.");
  }

  validateFilesTarget(tree.files ?? [], config.resolvedPaths.cwd);
  await updateDependencies(tree.dependencies, tree.devDependencies, config, {
    interactive: settings.interactive,
    silent: settings.silent,
  });
  await updateFiles(tree.files, config, settings);

  if (tree.docs) {
    logger.info(tree.docs);
  }
}

export function validateFilesTarget(
  files: z.infer<typeof registryItemFileSchema>[],
  cwd: string
) {
  for (const file of files) {
    if (!file.target) {
      continue;
    }

    if (!isSafeTarget(file.target, cwd)) {
      throw new Error(`The registry file target "${file.target}" is unsafe.`);
    }
  }
}
