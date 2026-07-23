import { promises as fs } from "node:fs";
import path from "node:path";

interface RegistryFile {
  path: string;
  target?: string;
  type: string;
}

interface RegistryItem {
  dependencies?: string[];
  files?: RegistryFile[];
  name: string;
  registryDependencies?: string[];
  type: string;
}

interface RegistryRoot {
  items: RegistryItem[];
  [key: string]: unknown;
}

const root = process.cwd();
const registryPath = path.join(root, "registry.json");
const write = process.argv.includes("--write");
const registry = JSON.parse(
  await fs.readFile(registryPath, "utf-8")
) as RegistryRoot;
const inkItems = registry.items.filter((item) => item.name.startsWith("ink/"));
const itemsByName = new Map(inkItems.map((item) => [item.name, item]));
const errors: string[] = [];
const browserInkRuntimeExports = new Set([
  "Box",
  "Newline",
  "Spacer",
  "Static",
  "Text",
  "Transform",
  "measureElement",
  "render",
  "useApp",
  "useCursor",
  "useFocus",
  "useFocusManager",
  "useInput",
  "useIsScreenReaderEnabled",
  "useStderr",
  "useStdin",
  "useStdout",
]);

const registryUrl = (name: string) => `https://termcn.dev/r/${name}.json`;

const dependencyNameFromUrl = (value: string): string | undefined => {
  const match = value.match(/\/r\/(ink\/[^/]+)\.json$/);
  return match?.[1];
};

const sourcePathFor = (file: RegistryFile): string | undefined => {
  const match = file.path.match(/^registry\/(ui|hooks|lib|themes)\/(.+)$/);
  if (!match) {
    return undefined;
  }
  return path.join(root, "registry", "bases", "ink", match[1], match[2]);
};

const importSpecifiers = (source: string): string[] => {
  const result: string[] = [];
  const expression =
    /\b(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g;
  for (const match of source.matchAll(expression)) {
    if (match[1]) {
      result.push(match[1]);
    }
  }
  return result;
};

const runtimeInkImports = (source: string): string[] => {
  const result: string[] = [];
  const expression = /import\s*\{([^}]*)\}\s*from\s*["']ink["']/g;
  for (const match of source.matchAll(expression)) {
    for (const specifier of (match[1] ?? "").split(",")) {
      const value = specifier.trim();
      if (!value || value.startsWith("type ")) {
        continue;
      }
      result.push(value.split(/\s+as\s+/)[0] ?? value);
    }
  }
  return result;
};

const sourceRegistryDependency = (
  specifier: string,
  sourcePath: string
): string | undefined => {
  if (specifier === "@/components/ui/ink-theme-provider") {
    return "ink/theme-provider";
  }
  if (specifier === "@/registry/bases/ink/ui/types") {
    return "ink/types";
  }
  if (specifier.startsWith("@/registry/bases/ink/themes/")) {
    return `ink/theme-${path.basename(specifier)}`;
  }
  if (specifier === "@/registry/bases/ink/lib/terminal-text") {
    return "ink/terminal-text";
  }
  if (specifier === "@/registry/bases/ink/lib/accessibility") {
    return "ink/accessibility";
  }
  if (specifier.startsWith("@/hooks/")) {
    const hook = path.basename(specifier);
    return hook === "use-interaction" ? "ink/interaction" : `ink/${hook}`;
  }
  if (specifier.startsWith("@/components/ui/")) {
    const component = path.basename(specifier);
    return `ink/${component}`;
  }
  if (specifier.startsWith(".")) {
    const dependencyBasename = path.basename(
      path.resolve(path.dirname(sourcePath), specifier)
    );
    return `ink/${dependencyBasename}`;
  }
  return undefined;
};

const npmPackageName = (specifier: string): string | undefined => {
  if (
    specifier.startsWith(".") ||
    specifier.startsWith("@/") ||
    specifier.startsWith("node:") ||
    specifier === "react" ||
    specifier.startsWith("react/")
  ) {
    return undefined;
  }
  if (specifier.startsWith("@")) {
    return specifier.split("/").slice(0, 2).join("/");
  }
  return specifier.split("/")[0];
};

for (const item of inkItems) {
  const inferredRegistryDependencies = new Set<string>();
  const inferredNpmDependencies = new Set<string>();
  for (const file of item.files ?? []) {
    const sourcePath = sourcePathFor(file);
    if (!sourcePath) {
      continue;
    }
    let source: string;
    try {
      source = await fs.readFile(sourcePath, "utf-8");
    } catch {
      errors.push(
        `${item.name}: missing source file ${path.relative(root, sourcePath)}`
      );
      continue;
    }
    if (/\b(?:TerminalBox|TerminalText)\b|ink-accessibility/.test(source)) {
      errors.push(
        `${item.name}: use Ink Box/Text directly and keep accessibility decisions local`
      );
    }
    if (
      file.path.startsWith("registry/ui/") &&
      source.includes("@deprecated")
    ) {
      errors.push(
        `${item.name}: copied UI component props must not carry deprecation annotations`
      );
    }
    if (
      file.path.startsWith("registry/ui/") &&
      [...source].some((character) => (character.codePointAt(0) ?? 0) > 127) &&
      !/\b(?:useUnicode|useUnicodeGlyphs|toAsciiComponentText)\b/.test(source)
    ) {
      errors.push(
        `${item.name}: component-owned Unicode output needs a local ASCII fallback`
      );
    }
    for (const importedName of runtimeInkImports(source)) {
      if (!browserInkRuntimeExports.has(importedName)) {
        errors.push(
          `${item.name}: Ink runtime export ${importedName} needs an ink-web adapter before it can enter the browser preview graph`
        );
      }
    }
    for (const specifier of importSpecifiers(source)) {
      const registryDependency = sourceRegistryDependency(
        specifier,
        sourcePath
      );
      if (
        registryDependency &&
        registryDependency !== item.name &&
        itemsByName.has(registryDependency)
      ) {
        inferredRegistryDependencies.add(registryDependency);
      }
      const npmDependency = npmPackageName(specifier);
      if (npmDependency) {
        inferredNpmDependencies.add(npmDependency);
      }
    }
  }

  const expectedRegistryDependencies = [...inferredRegistryDependencies]
    .toSorted()
    .map(registryUrl);
  const expectedNpmDependencies = [...inferredNpmDependencies].toSorted();
  if (item.name === "ink/terminal-text") {
    expectedNpmDependencies.splice(
      expectedNpmDependencies.indexOf("string-width"),
      1,
      "string-width@8.2.0"
    );
  }

  if (write) {
    if (expectedRegistryDependencies.length > 0) {
      item.registryDependencies = expectedRegistryDependencies;
    } else {
      delete item.registryDependencies;
    }
    if (expectedNpmDependencies.length > 0) {
      item.dependencies = expectedNpmDependencies;
    } else {
      delete item.dependencies;
    }
  } else {
    const actualRegistryDependencies = [
      ...new Set(item.registryDependencies),
    ].toSorted();
    const actualNpmDependencies = [...new Set(item.dependencies)].toSorted();
    if (
      JSON.stringify(actualRegistryDependencies) !==
      JSON.stringify(expectedRegistryDependencies)
    ) {
      errors.push(
        `${item.name}: registry dependencies are stale; run pnpm registry:sync`
      );
    }
    if (
      JSON.stringify(actualNpmDependencies) !==
      JSON.stringify(expectedNpmDependencies)
    ) {
      errors.push(
        `${item.name}: npm dependencies are stale; run pnpm registry:sync`
      );
    }
  }
}

const accessibilityItem = itemsByName.get("ink/accessibility");
const accessibilityFile = accessibilityItem?.files?.[0];
if (
  accessibilityFile?.path !== "registry/lib/accessibility.ts" ||
  accessibilityFile.target !== "lib/accessibility.ts"
) {
  errors.push(
    "ink/accessibility: must install as the pure lib/accessibility.ts utility"
  );
}

for (const hookName of ["use-motion", "use-theme", "use-unicode"]) {
  const item = itemsByName.get(`ink/${hookName}`);
  const file = item?.files?.[0];
  if (
    item?.type !== "registry:hook" ||
    item.files?.length !== 1 ||
    file?.path !== `registry/hooks/${hookName}.ts` ||
    file.type !== "registry:hook"
  ) {
    errors.push(
      `ink/${hookName}: must publish as a standalone registry:hook item`
    );
  }
}

const providerItem = itemsByName.get("ink/theme-provider");
const providerFile = providerItem?.files?.[0];
if (providerFile) {
  const providerPath = sourcePathFor(providerFile);
  const providerSource = providerPath
    ? await fs.readFile(providerPath, "utf-8")
    : "";
  if (
    /export const use(?:Motion|Theme|ThemeUpdater|Unicode)\b/.test(
      providerSource
    )
  ) {
    errors.push(
      "ink/theme-provider: theme, motion, and Unicode hooks belong in registry/hooks"
    );
  }
}

const inkWebAdapterSource = await fs.readFile(
  path.join(root, "lib/ink-web-adapter.ts"),
  "utf-8"
);
const nextConfigSource = await fs.readFile(
  path.join(root, "next.config.mjs"),
  "utf-8"
);
if (
  !inkWebAdapterSource.includes('export * from "ink-web"') ||
  !inkWebAdapterSource.includes("export const useCursor") ||
  !nextConfigSource.includes("ink: inkWebAdapterTurbo")
) {
  errors.push(
    "browser preview: ink must resolve through the ink-web adapter with useCursor compatibility"
  );
}

const inkDocumentationRoots = [
  "content/docs/components/ink",
  "content/docs/charts/ink",
  "content/docs/templates/ink",
].map((directory) => path.join(root, directory));

const findMdxFiles = async (directory: string): Promise<string[]> => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findMdxFiles(entryPath)));
    } else if (entry.name.endsWith(".mdx")) {
      files.push(entryPath);
    }
  }
  return files;
};

for (const documentationRoot of inkDocumentationRoots) {
  for (const file of await findMdxFiles(documentationRoot)) {
    const source = await fs.readFile(file, "utf-8");
    if (source.includes("<!--")) {
      errors.push(
        `${path.relative(root, file)}: MDX comments must use {/* ... */}`
      );
    }
  }
}

const visiting = new Set<string>();
const visited = new Set<string>();
const visit = (name: string, stack: string[]) => {
  if (visiting.has(name)) {
    errors.push(`registry dependency cycle: ${[...stack, name].join(" -> ")}`);
    return;
  }
  if (visited.has(name)) {
    return;
  }
  visiting.add(name);
  const item = itemsByName.get(name);
  for (const dependency of item?.registryDependencies ?? []) {
    const dependencyName = dependencyNameFromUrl(dependency);
    if (!dependencyName || !itemsByName.has(dependencyName)) {
      continue;
    }
    if (
      name !== "ink/use-input" &&
      name !== "ink/use-focus" &&
      (dependencyName === "ink/use-input" || dependencyName === "ink/use-focus")
    ) {
      errors.push(`${name}: v1 items may not depend on ${dependencyName}`);
    }
    visit(dependencyName, [...stack, name]);
  }
  visiting.delete(name);
  visited.add(name);
};

for (const item of inkItems) {
  visit(item.name, []);
}

if (write) {
  await fs.writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  console.log(`Synchronized ${inkItems.length} Ink registry items.`);
} else if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${inkItems.length} Ink registry items.`);
}
