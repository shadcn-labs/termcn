import { existsSync, promises as fs } from "node:fs";
import path from "node:path";

import { configWithDefaults } from "@/src/registry/config";
import { resolveRegistryTree } from "@/src/registry/resolver";
import { isContentSame } from "@/src/utils/compare";
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

export type DryRunResult = {
  files: DryRunFile[];
  dependencies: string[];
  devDependencies: string[];
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
    const filePath = resolveFilePath(file, config, { fileIndex: index });
    if (!filePath) continue;

    const isUniversal =
      file.type === "registry:file" || file.type === "registry:item";
    const isCode = [".ts", ".tsx", ".js", ".jsx"].includes(
      path.extname(filePath)
    );
    const content =
      isUniversal || !isCode
        ? file.content
        : await transform({
            config,
            filename: file.path,
            raw: file.content,
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

  return result;
}
