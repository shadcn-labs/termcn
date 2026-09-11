import {
  createMatchPath,
  type ConfigLoaderSuccessResult,
} from "tsconfig-paths";

const RESOLVE_EXTENSIONS = [".ts", ".tsx", ".jsx", ".js"];

type ResolveImportConfig = Pick<
  ConfigLoaderSuccessResult,
  "absoluteBaseUrl" | "paths"
> & {
  cwd?: string;
};

/**
 * Resolves a configured alias (e.g. `@/components/ui`) to an absolute path
 * using the project's tsconfig `baseUrl` + `paths`.
 *
 * Scoped package specifiers that are not covered by an explicit `paths` entry
 * resolve to `null`: `createMatchPath` would otherwise happily map
 * `@scope/pkg` onto `<baseUrl>/@scope/pkg`, inventing a directory that only
 * exists in node_modules.
 */
export function resolveImport(
  importPath: string,
  config: ResolveImportConfig
): string | null {
  const matchedPath = createMatchPath(config.absoluteBaseUrl, config.paths)(
    importPath,
    undefined,
    () => true,
    RESOLVE_EXTENSIONS
  );

  if (!matchedPath) {
    return null;
  }

  const hasExplicitPattern = Object.keys(config.paths).some((pattern) =>
    matchesPathPattern(importPath, pattern)
  );

  if (!hasExplicitPattern && /^@[^/]+\/[^/]+(?:\/.*)?$/.test(importPath)) {
    return null;
  }

  return matchedPath;
}

function matchesPathPattern(importPath: string, pattern: string) {
  const wildcardIndex = pattern.indexOf("*");

  if (wildcardIndex === -1) {
    return importPath === pattern;
  }

  const prefix = pattern.slice(0, wildcardIndex);
  const suffix = pattern.slice(wildcardIndex + 1);

  return (
    importPath.length >= prefix.length + suffix.length &&
    importPath.startsWith(prefix) &&
    importPath.endsWith(suffix)
  );
}
