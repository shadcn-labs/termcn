import { execa } from "execa";

import { RegistryItem } from "@/src/schema";
import { Config } from "@/src/utils/get-config";
import { getPackageInfo } from "@/src/utils/get-package-info";
import { getPackageManager } from "@/src/utils/get-package-manager";
import { spinner } from "@/src/utils/spinner";

export async function updateDependencies(
  dependencies: RegistryItem["dependencies"],
  devDependencies: RegistryItem["devDependencies"],
  config: Config,
  options: {
    silent?: boolean;
    interactive?: boolean;
  }
) {
  const packageInfo = getPackageInfo(config.resolvedPaths.cwd, false);
  const packageManager = await getPackageManager(config.resolvedPaths.cwd);

  dependencies = normalizeDependencyRequests(dependencies, packageInfo);
  devDependencies = normalizeDependencyRequests(devDependencies, packageInfo);

  if (!dependencies?.length && !devDependencies?.length) {
    return;
  }

  options = {
    silent: false,
    interactive: true,
    ...options,
  };

  const dependenciesSpinner = spinner(`Installing dependencies.`, {
    silent: options.silent,
  })?.start();

  dependenciesSpinner?.start();

  await installWithPackageManager(
    packageManager,
    dependencies,
    devDependencies,
    config.resolvedPaths.cwd
  );

  dependenciesSpinner?.succeed();
}

/**
 * The registry hands us bare package names (e.g. "recharts"). Forwarding a bare
 * name to `pnpm add` / `npm install` re-resolves it to the current `latest` and
 * overwrites whatever specifier is already declared in package.json. Re-running
 * `termcn add` therefore silently rewrites existing dependency ranges (#10525).
 *
 * To keep the operation idempotent we drop bare requests for packages that are
 * already declared, while still installing explicit specs (e.g. "recharts@3.8.0")
 * so a registry item can intentionally pin a version. Within a single request we
 * also dedupe by package name, preferring the explicit spec over a bare one.
 */
function normalizeDependencyRequests(
  dependencies: RegistryItem["dependencies"] = [],
  packageInfo: ReturnType<typeof getPackageInfo>
) {
  const installedDependencies = new Set([
    ...Object.keys(packageInfo?.dependencies ?? {}),
    ...Object.keys(packageInfo?.devDependencies ?? {}),
    ...Object.keys(packageInfo?.optionalDependencies ?? {}),
    ...Object.keys(packageInfo?.peerDependencies ?? {}),
  ]);

  const installRequests = new Map<
    string,
    { dependency: string; hasSpecifier: boolean }
  >();

  for (const dependency of dependencies) {
    const packageRequest = parsePackageRequest(dependency);

    // Protocol/alias specs (file:, workspace:, git+https:, npm:, etc.) are kept
    // as-is since we cannot reliably reason about their declared version.
    if (!packageRequest) {
      installRequests.set(dependency, { dependency, hasSpecifier: true });
      continue;
    }

    // Bare name that is already declared in package.json -> skip so we never
    // rewrite the existing specifier (this is the #10525 fix).
    if (
      !packageRequest.hasSpecifier &&
      installedDependencies.has(packageRequest.name)
    ) {
      continue;
    }

    const existing = installRequests.get(packageRequest.name);
    if (!existing || (!existing.hasSpecifier && packageRequest.hasSpecifier)) {
      installRequests.set(packageRequest.name, {
        dependency,
        hasSpecifier: packageRequest.hasSpecifier,
      });
    }
  }

  return Array.from(installRequests.values()).map(
    ({ dependency }) => dependency
  );
}

function parsePackageRequest(dependency: string) {
  // Protocol-prefixed specs: file:, workspace:, link:, git+https:, npm:, etc.
  if (/^[a-z][a-z0-9+.-]*:/i.test(dependency)) {
    return null;
  }

  const match = dependency.startsWith("@")
    ? dependency.match(/^(@[^/]+\/[^@/]+)(@.+)?$/)
    : dependency.match(/^([^@/]+)(@.+)?$/);

  if (!match) {
    return null;
  }

  return {
    name: match[1],
    hasSpecifier: Boolean(match[2]),
  };
}

/**
 * Registry-supplied dependency strings are forwarded directly into the package
 * manager's argument list. A specifier beginning with "-" would be interpreted
 * as a flag rather than a package name, letting a malicious registry alter the
 * install source/behavior (argument injection). Reject those before they reach
 * `execa`; the `--` end-of-options separator added at each call site is the
 * second layer of defense.
 */
export function assertSafeDependencies(deps: string[]) {
  for (const dep of deps) {
    if (dep.trim().startsWith("-")) {
      throw new Error(
        `Invalid dependency "${dep}": dependency names cannot start with "-".`
      );
    }
  }
}

async function installWithPackageManager(
  packageManager: string,
  dependencies: string[],
  devDependencies: string[],
  cwd: string
) {
  if (packageManager === "npm") {
    return installWithNpm(dependencies, devDependencies, cwd);
  }

  if (packageManager === "deno") {
    return installWithDeno(dependencies, devDependencies, cwd);
  }

  assertSafeDependencies(dependencies);
  assertSafeDependencies(devDependencies);

  if (dependencies?.length) {
    await execa(packageManager, ["add", "--", ...dependencies], {
      cwd,
    });
  }

  if (devDependencies?.length) {
    await execa(packageManager, ["add", "-D", "--", ...devDependencies], {
      cwd,
    });
  }
}

async function installWithNpm(
  dependencies: string[],
  devDependencies: string[],
  cwd: string
) {
  assertSafeDependencies(dependencies);
  assertSafeDependencies(devDependencies);

  if (dependencies.length) {
    await execa("npm", ["install", "--", ...dependencies], { cwd });
  }

  if (devDependencies.length) {
    await execa("npm", ["install", "-D", "--", ...devDependencies], { cwd });
  }
}

async function installWithDeno(
  dependencies: string[],
  devDependencies: string[],
  cwd: string
) {
  if (dependencies?.length) {
    await execa("deno", ["add", ...dependencies.map((dep) => `npm:${dep}`)], {
      cwd,
    });
  }

  if (devDependencies?.length) {
    await execa(
      "deno",
      ["add", "-D", ...devDependencies.map((dep) => `npm:${dep}`)],
      { cwd }
    );
  }
}
