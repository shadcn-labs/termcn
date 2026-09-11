import { existsSync, promises as fs, statSync } from "node:fs";
import path from "node:path";

import type { Ora } from "ora";
import prompts from "prompts";
import { z } from "zod";

import { type RegistryItem, registryItemFileSchema } from "@/src/schema";
import { isContentSame } from "@/src/utils/compare";
import { type Config } from "@/src/utils/get-config";
import { logger } from "@/src/utils/logger";
import { spinner } from "@/src/utils/spinner";
import { isTargetAliasKey } from "@/src/utils/target-aliases";
import { transform } from "@/src/utils/transformers";

const CODE_EXTENSIONS: Record<string, true> = {
  ".ts": true,
  ".tsx": true,
  ".js": true,
  ".jsx": true,
};

export async function updateFiles(
  files: RegistryItem["files"],
  config: Config,
  options: {
    overwrite?: boolean;
    silent?: boolean;
    interactive?: boolean;
    path?: string;
  } = {}
) {
  const settings = {
    overwrite: false,
    silent: false,
    interactive: true,
    ...options,
  };
  const result = {
    filesCreated: [] as string[],
    filesUpdated: [] as string[],
    filesSkipped: [] as string[],
  };

  if (!files?.length) {
    return result;
  }

  const progress = spinner("Updating files.", {
    silent: settings.silent,
  })?.start();
  for (const [index, file] of files.entries()) {
    if (file.content === undefined) {
      continue;
    }

    const filePath = resolveFilePath(file, config, {
      fileIndex: index,
      path: settings.path,
    });
    if (!filePath) {
      continue;
    }

    const exists = existsSync(filePath);
    if (exists && statSync(filePath).isDirectory()) {
      throw new Error(`Cannot write to ${filePath}: path is a directory.`);
    }

    const isUniversal =
      file.type === "registry:file" || file.type === "registry:item";
    const content =
      isUniversal || !CODE_EXTENSIONS[path.extname(filePath)]
        ? file.content
        : await transform({
            config,
            filename: file.path,
            raw: file.content,
          });
    const relativePath = path.relative(config.resolvedPaths.cwd, filePath);

    if (exists) {
      const existingContent = await fs.readFile(filePath, "utf8");
      if (isContentSame(existingContent, content)) {
        result.filesSkipped.push(relativePath);
        continue;
      }

      if (!settings.overwrite) {
        if (!settings.interactive) {
          result.filesSkipped.push(relativePath);
          continue;
        }

        progress?.stop();
        const { overwrite } = await prompts({
          type: "confirm",
          name: "overwrite",
          message: `${relativePath} already exists. Overwrite it?`,
          initial: false,
        });
        if (!overwrite) {
          result.filesSkipped.push(relativePath);
          progress?.start();
          continue;
        }
        progress?.start();
      }
    }

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, "utf8");

    if (exists) {
      result.filesUpdated.push(relativePath);
    } else {
      result.filesCreated.push(relativePath);
    }
  }

  result.filesCreated = unique(result.filesCreated);
  result.filesUpdated = unique(
    result.filesUpdated.filter((file) => !result.filesCreated.includes(file))
  );
  result.filesSkipped = unique(result.filesSkipped);

  reportFiles(progress, result, settings.silent);

  return result;
}

export function resolveFilePath(
  file: z.infer<typeof registryItemFileSchema>,
  config: Config,
  options: { path?: string; fileIndex?: number; commonRoot?: string } = {}
) {
  if (options.path) {
    const customPath = path.resolve(config.resolvedPaths.cwd, options.path);
    if (/\.[^/\\]+$/.test(customPath)) {
      return options.fileIndex === 0 ? customPath : "";
    }
    return path.join(customPath, path.basename(file.path));
  }

  if (file.target) {
    if (file.target.startsWith("~/")) {
      return path.join(config.resolvedPaths.cwd, file.target.slice(2));
    }

    const aliasMatch = file.target.match(/^@([^/]+)\/(.+)$/);
    if (!aliasMatch || !isTargetAliasKey(aliasMatch[1])) {
      throw new Error(
        `Invalid target "${file.target}". Targets must use a configured alias (for example @ui/button.tsx) or start with ~/.`
      );
    }

    const aliasRoot = path.resolve(config.resolvedPaths[aliasMatch[1]]);
    const target = path.resolve(aliasRoot, aliasMatch[2]);
    if (target !== aliasRoot && !target.startsWith(`${aliasRoot}${path.sep}`)) {
      throw new Error(
        `Invalid target path "${file.target}". Alias targets must stay within @${aliasMatch[1]}.`
      );
    }
    return target;
  }

  const targetDir = resolveFileTargetDirectory(file, config);
  return path.join(targetDir, resolveNestedFilePath(file.path, targetDir));
}

export function findCommonRoot(paths: string[], needle: string) {
  const normalizedNeedle = needle.replace(/^\//, "");
  const segments = normalizedNeedle.split("/").slice(0, -1);

  for (let index = segments.length; index > 0; index--) {
    const candidate = segments.slice(0, index).join("/");
    if (
      paths.some(
        (entry) =>
          entry.replace(/^\//, "") !== normalizedNeedle &&
          entry.replace(/^\//, "").startsWith(`${candidate}/`)
      )
    ) {
      return `/${candidate}`;
    }
  }

  return segments.length > 0 ? `/${segments.join("/")}` : "";
}

export function resolveNestedFilePath(filePath: string, targetDir: string) {
  const fileSegments = filePath.replace(/^\/|\/$/g, "").split("/");
  const targetSegment = targetDir
    .replace(/^\/|\/$/g, "")
    .split("/")
    .at(-1);
  const commonIndex = targetSegment ? fileSegments.indexOf(targetSegment) : -1;

  return commonIndex === -1
    ? (fileSegments.at(-1) ?? "")
    : fileSegments.slice(commonIndex + 1).join("/");
}

function resolveFileTargetDirectory(
  file: z.infer<typeof registryItemFileSchema>,
  config: Config
) {
  if (file.type === "registry:ui" || file.type === "registry:block") {
    return config.resolvedPaths.ui;
  }
  if (file.type === "registry:lib") return config.resolvedPaths.lib;
  if (file.type === "registry:hook") return config.resolvedPaths.hooks;
  if (file.type === "registry:theme") return config.resolvedPaths.themes;
  return config.resolvedPaths.components;
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function reportFiles(
  progress: Ora | undefined,
  result: {
    filesCreated: string[];
    filesUpdated: string[];
    filesSkipped: string[];
  },
  silent: boolean
) {
  if (result.filesCreated.length > 0) {
    progress?.succeed(`Created ${result.filesCreated.length} file(s).`);
  } else {
    progress?.stop();
  }

  for (const [label, files] of [
    ["Updated", result.filesUpdated],
    ["Skipped", result.filesSkipped],
  ] as const) {
    if (files.length === 0) continue;
    spinner(`${label} ${files.length} file(s).`, { silent })?.info();
    if (!silent) {
      for (const file of files) logger.log(`  - ${file}`);
    }
  }
}
