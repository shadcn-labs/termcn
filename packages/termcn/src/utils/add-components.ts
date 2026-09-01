import { z } from "zod";

import { configWithDefaults } from "@/src/registry/config";
import { resolveRegistryTree } from "@/src/registry/resolver";
import {
  configSchema,
  registryItemFileSchema,
  workspaceConfigSchema,
} from "@/src/schema";
import { getWorkspaceConfig, type Config } from "@/src/utils/get-config";
import { isSafeTarget } from "@/src/utils/is-safe-target";
import { logger } from "@/src/utils/logger";
import {
  getTargetAliasKey,
  type TargetAliasKey,
} from "@/src/utils/target-aliases";
import { updateDependencies } from "@/src/utils/updaters/update-dependencies";
import { updateEnvVars } from "@/src/utils/updaters/update-env-vars";
import { updateFiles } from "@/src/utils/updaters/update-files";

export interface AddComponentsOptions {
  overwrite?: boolean;
  silent?: boolean;
  interactive?: boolean;
  resolvedTree?: NonNullable<Awaited<ReturnType<typeof resolveRegistryTree>>>;
  path?: string;
}

export async function addComponents(
  components: string[],
  config: Config,
  options: AddComponentsOptions = {}
) {
  if (components.length === 0) return;

  const settings = {
    overwrite: false,
    silent: false,
    interactive: true,
    ...options,
  };
  const workspace = await getWorkspaceConfig(config);

  if (
    workspace?.ui &&
    workspace.ui.resolvedPaths.cwd !== config.resolvedPaths.cwd
  ) {
    await addWorkspaceComponents(components, config, workspace, settings);
    return;
  }

  const tree = await resolveAndValidateTree(components, config, settings);
  await installSharedData(tree, config, settings);
  await updateFiles(tree.files, config, settings);
  if (tree.docs) logger.info(tree.docs);
}

async function addWorkspaceComponents(
  components: string[],
  config: z.infer<typeof configSchema>,
  workspace: z.infer<typeof workspaceConfigSchema>,
  options: AddComponentsOptions
) {
  const tree = await resolveAndValidateTree(components, config, options);
  const mainConfig = workspace.ui ?? config;
  await installSharedData(tree, mainConfig, options);

  const filesByTarget = new Map<TargetAliasKey, typeof tree.files>();
  for (const file of tree.files ?? []) {
    const key =
      getTargetAliasKey(file.target) ??
      fileTypeTarget(file.type) ??
      "components";
    filesByTarget.set(key, [...(filesByTarget.get(key) ?? []), file]);
  }

  for (const [key, files] of filesByTarget) {
    await updateFiles(files, workspace[key] ?? config, options);
  }

  if (tree.docs) logger.info(tree.docs);
}

async function installSharedData(
  tree: NonNullable<Awaited<ReturnType<typeof resolveRegistryTree>>>,
  config: Config,
  options: AddComponentsOptions
) {
  await updateDependencies(tree.dependencies, tree.devDependencies, config, {
    interactive: options.interactive,
    silent: options.silent,
  });
  await updateEnvVars(tree.envVars, config, { silent: options.silent });
}

async function resolveAndValidateTree(
  components: string[],
  config: Config,
  options: AddComponentsOptions
) {
  const tree =
    options.resolvedTree ??
    (await resolveRegistryTree(components, configWithDefaults(config)));
  if (!tree) throw new Error("Failed to fetch components from registry.");
  validateFilesTarget(tree.files ?? [], config.resolvedPaths.cwd);
  return tree;
}

function fileTypeTarget(type: string | undefined): TargetAliasKey | null {
  if (type === "registry:ui") return "ui";
  if (type === "registry:hook") return "hooks";
  if (type === "registry:lib") return "lib";
  return null;
}

export function validateFilesTarget(
  files: z.infer<typeof registryItemFileSchema>[],
  cwd: string
) {
  for (const file of files) {
    const location = file.target ?? file.path;
    if (location && !isSafeTarget(location, cwd)) {
      throw new Error(
        `Unsafe file path "${location}" found in a registry item. Installation aborted.`
      );
    }
  }
}
