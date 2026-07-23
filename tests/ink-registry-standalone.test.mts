import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

interface RegistryFile {
  content?: string;
  path: string;
  target?: string;
  type?: string;
}
interface RegistryItem {
  dependencies?: string[];
  files?: RegistryFile[];
  name: string;
  registryDependencies?: string[];
  type?: string;
}

const root = process.cwd();
const registry = JSON.parse(
  await readFile(path.join(root, "public/r/registry.json"), "utf-8")
) as { items: RegistryItem[] };
const inkItems = registry.items.filter((item) => item.name.startsWith("ink/"));
const itemCache = new Map<string, RegistryItem>();

test("theme behavior is published as standalone hook items", () => {
  for (const hookName of ["use-motion", "use-theme", "use-unicode"]) {
    const item = inkItems.find(
      (candidate) => candidate.name === `ink/${hookName}`
    );
    assert.equal(item?.type, "registry:hook");
    assert.deepEqual(
      item?.files?.map((file) => [file.path, file.type]),
      [[`registry/hooks/${hookName}.ts`, "registry:hook"]]
    );
  }
});

const nameFromDependency = (dependency: string) => {
  const match = dependency.match(/\/r\/(ink\/[^/]+)\.json$/);
  return match?.[1];
};

const loadItem = async (name: string) => {
  const cached = itemCache.get(name);
  if (cached) {
    return cached;
  }
  const item = JSON.parse(
    await readFile(path.join(root, "public/r", `${name}.json`), "utf-8")
  ) as RegistryItem;
  itemCache.set(name, item);
  return item;
};

const resolveItemGraph = async (rootItem: RegistryItem) => {
  const pending = [rootItem.name];
  const visited = new Set<string>();
  const declaredPackages = new Set(["react"]);
  const files: RegistryFile[] = [];
  while (pending.length > 0) {
    const name = pending.pop();
    if (!name || visited.has(name)) {
      continue;
    }
    visited.add(name);
    const item = await loadItem(name);
    for (const dependency of item.dependencies ?? []) {
      declaredPackages.add(dependency.replace(/@\d.*$/, ""));
    }
    files.push(...(item.files ?? []));
    for (const dependency of item.registryDependencies ?? []) {
      const dependencyName = nameFromDependency(dependency);
      assert.ok(
        dependencyName,
        `${name}: invalid registry dependency ${dependency}`
      );
      if (!visited.has(dependencyName)) {
        pending.push(dependencyName);
      }
    }
  }

  return { declaredPackages, files };
};

const externalPackage = (specifier: string) => {
  if (
    specifier.startsWith(".") ||
    specifier.startsWith("@/") ||
    specifier.startsWith("node:") ||
    specifier === "react" ||
    specifier.startsWith("react/")
  ) {
    return;
  }
  return specifier.startsWith("@")
    ? specifier.split("/").slice(0, 2).join("/")
    : specifier.split("/")[0];
};

test("every published Ink item materializes with complete transitive dependencies", async () => {
  assert.ok(inkItems.length >= 120);
  for (const rootItem of inkItems) {
    const { declaredPackages, files } = await resolveItemGraph(rootItem);

    for (const file of files) {
      const source = file.content ?? "";
      assert.doesNotMatch(
        source,
        /@\/registry\/bases\//,
        `${rootItem.name}: source-only import in ${file.path}`
      );
      assert.doesNotMatch(
        source,
        /@\/components\/ui\/ink-theme-provider/,
        `${rootItem.name}: unpublished provider import`
      );
      assert.doesNotMatch(
        source,
        /@\/hooks\/use-(?:input|focus)/,
        `${rootItem.name}: legacy hook dependency`
      );
      for (const match of source.matchAll(
        /\b(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g
      )) {
        const packageName = externalPackage(match[1] ?? "");
        if (packageName) {
          assert.ok(
            declaredPackages.has(packageName),
            `${rootItem.name}: ${packageName} is imported by ${file.path} but not declared`
          );
        }
      }
    }
  }
});

const fixturePath = (file: RegistryFile) => {
  if (file.target) {
    return file.target;
  }
  if (file.path.startsWith("registry/ui/")) {
    return file.path.replace("registry/ui/", "components/ui/");
  }
  if (file.path.startsWith("registry/hooks/")) {
    return file.path.replace("registry/hooks/", "hooks/");
  }
  if (file.path.startsWith("registry/lib/")) {
    return file.path.replace("registry/lib/", "lib/");
  }
  return file.path.replace(/^registry\//, "");
};

const rewriteFixtureAliases = (source: string, destination: string) =>
  source.replaceAll(/(["'])@\/([^"']+)\1/g, (_match, quote, specifier) => {
    const relative = path.posix.relative(
      path.posix.dirname(destination),
      specifier
    );
    return `${quote}${relative.startsWith(".") ? relative : `./${relative}`}${quote}`;
  });

const writeFixtureConfig = async (fixture: string) => {
  await writeFile(
    path.join(fixture, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        baseUrl: ".",
        esModuleInterop: true,
        ignoreDeprecations: "6.0",
        jsx: "react-jsx",
        lib: ["DOM", "ES2023"],
        module: "ESNext",
        moduleResolution: "Bundler",
        noEmit: true,
        paths: { "@/*": ["./*"] },
        skipLibCheck: true,
        strict: true,
        target: "ES2023",
        types: ["node"],
      },
      include: ["**/*.ts", "**/*.tsx"],
    })
  );
};

const typecheckFixture = (fixture: string) => {
  execFileSync(
    process.execPath,
    [path.join(root, "node_modules/typescript/bin/tsc"), "-p", fixture],
    { cwd: fixture, stdio: "inherit" }
  );
};

test("every Ink item type-checks with only its transitive source files", async () => {
  const fixture = await mkdtemp(path.join(root, ".ink-item-fixtures-"));
  try {
    for (const rootItem of inkItems) {
      const itemRoot = rootItem.name.replaceAll("/", "__");
      const { files } = await resolveItemGraph(rootItem);
      const materialized = new Map<string, string>();
      for (const file of files) {
        const destination = fixturePath(file);
        const source = rewriteFixtureAliases(file.content ?? "", destination);
        const existing = materialized.get(destination);
        assert.ok(
          existing === undefined || existing === source,
          `${rootItem.name}: conflicting generated file ${destination}`
        );
        materialized.set(destination, source);
      }

      for (const [destination, source] of materialized) {
        const absolutePath = path.join(fixture, itemRoot, destination);
        await mkdir(path.dirname(absolutePath), { recursive: true });
        await writeFile(absolutePath, source);
      }
    }

    await writeFixtureConfig(fixture);
    typecheckFixture(fixture);
  } finally {
    await rm(fixture, { force: true, recursive: true });
  }
});

test("the complete generated Ink source set type-checks as an installed fixture", async () => {
  const fixture = await mkdtemp(path.join(root, ".ink-registry-fixture-"));
  try {
    const materialized = new Map<string, string>();
    for (const rootItem of inkItems) {
      const item = await loadItem(rootItem.name);
      for (const file of item.files ?? []) {
        const destination = fixturePath(file);
        const source = file.content ?? "";
        const existing = materialized.get(destination);
        assert.ok(
          existing === undefined || existing === source,
          `${rootItem.name}: conflicting generated file ${destination}`
        );
        materialized.set(destination, source);
      }
    }

    for (const [destination, source] of materialized) {
      const absolutePath = path.join(fixture, destination);
      await mkdir(path.dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, source);
    }

    await writeFixtureConfig(fixture);
    typecheckFixture(fixture);
  } finally {
    await rm(fixture, { force: true, recursive: true });
  }
});
