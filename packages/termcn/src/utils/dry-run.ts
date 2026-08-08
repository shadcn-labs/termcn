import { existsSync, promises as fs } from "node:fs";
import path from "node:path";

import { configWithDefaults } from "@/src/registry/config";
import { resolveRegistryTree } from "@/src/registry/resolver";
import { isContentSame } from "@/src/utils/compare";
import { isEnvFile } from "@/src/utils/env-helpers";
import type { Config } from "@/src/utils/get-config";
import { transform } from "@/src/utils/transformers";
import { resolveFilePath } from "@/src/utils/updaters/update-files";

export type DryRunFile = {
  path: string;
  action: "create" | "overwrite" | "skip";
  content: string;
  existingContent?: string;
  type: string;
};

export type DryRunEnvVars = {
  path: string;
  variables: Record<string, string>;
  action: "create" | "update";
};

export type DryRunResult = {
  files: DryRunFile[];
  dependencies: string[];
  devDependencies: string[];
  envVars: DryRunEnvVars | null;
  docs: string | null;
};

export async function dryRunComponents(
  components: string[],
  config: Config,
  options: { overwrite?: boolean } = {}
) {
  const result: DryRunResult = {
    files: [],
    dependencies: [],
    devDependencies: [],
    envVars: null,
    docs: null,
  };
  if (components.length === 0) return result;

  const tree = await resolveRegistryTree(
    components,
    configWithDefaults(config)
  );
  if (!tree) throw new Error("Failed to fetch components from registry.");

  result.dependencies = Array.from(new Set(tree.dependencies ?? []));
  result.devDependencies = Array.from(new Set(tree.devDependencies ?? []));
  result.docs = tree.docs || null;

  for (const [index, file] of (tree.files ?? []).entries()) {
    if (file.content === undefined) continue;
    let filePath = resolveFilePath(file, config, { fileIndex: index });
    if (!filePath) continue;
    if (!config.tsx) {
      filePath = filePath.replace(/\.tsx?$/, (extension) =>
        extension === ".tsx" ? ".jsx" : ".js"
      );
    }

    const isUniversal =
      file.type === "registry:file" || file.type === "registry:item";
    const isCode = [".ts", ".tsx", ".js", ".jsx"].includes(
      path.extname(filePath)
    );
    const content =
      isUniversal || isEnvFile(filePath) || !isCode
        ? file.content
        : await transform({
            config,
            filename: file.path,
            raw: file.content,
            transformJsx: !config.tsx,
          });
    const relativePath = path.relative(config.resolvedPaths.cwd, filePath);
    const exists = existsSync(filePath);
    const existingContent = exists
      ? await fs.readFile(filePath, "utf8")
      : undefined;
    const action = !exists
      ? "create"
      : isContentSame(existingContent ?? "", content)
        ? "skip"
        : "overwrite";

    result.files.push({
      action,
      content,
      ...(action === "overwrite" ? { existingContent } : {}),
      path: relativePath,
      type: file.type ?? "registry:ui",
    });
  }

  if (tree.envVars && Object.keys(tree.envVars).length > 0) {
    const envPath = path.join(config.resolvedPaths.cwd, ".env.local");
    result.envVars = {
      action: existsSync(envPath) ? "update" : "create",
      path: path.relative(config.resolvedPaths.cwd, envPath),
      variables: tree.envVars,
    };
  }

  return result;
}
