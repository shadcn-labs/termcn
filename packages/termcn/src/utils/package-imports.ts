import path from "path";

import { getPackageInfo } from "@/src/utils/get-package-info";
import {
  getImportTargetEmitMode,
  resolveImportEntryMatch,
  resolveLocalPathTarget,
  type ImportEmitMode,
  type ImportResolutionEntry,
  type ImportResolutionMatch,
} from "@/src/utils/import-matcher";

export type { ImportEmitMode } from "@/src/utils/import-matcher";
export type PackageImportEntry = ImportResolutionEntry;
export type PackageImportMatch = ImportResolutionMatch;

const packageImportEntriesCache = new Map<string, PackageImportEntry[]>();

export function getPackageImportEntries(cwd: string) {
  const cacheKey = path.resolve(cwd);
  const cachedEntries = packageImportEntriesCache.get(cacheKey);

  if (cachedEntries) {
    return cachedEntries;
  }

  const packageInfo = getPackageInfo(cwd, false);
  const imports = packageInfo?.imports;

  if (!imports || typeof imports !== "object" || Array.isArray(imports)) {
    packageImportEntriesCache.set(cacheKey, []);
    return [];
  }

  const entries: PackageImportEntry[] = [];

  for (const [key, value] of Object.entries(imports)) {
    if (!key.startsWith("#")) {
      continue;
    }

    const target = resolveLocalPathTarget(value);
    if (!target) {
      continue;
    }

    entries.push({
      key,
      aliasBase:
        key === "#*" ? "#" : key.endsWith("/*") ? key.slice(0, -2) : key,
      target,
      emitMode: getImportTargetEmitMode(target),
      hasWildcard: key.includes("*"),
      rootDir: cacheKey,
    });
  }

  packageImportEntriesCache.set(cacheKey, entries);
  return entries;
}

export function resolvePackageImport(importPath: string, cwd: string) {
  return resolveImportEntryMatch(importPath, getPackageImportEntries(cwd));
}
