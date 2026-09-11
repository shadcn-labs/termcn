import { Config } from "@/src/utils/get-config";
import { Transformer } from "@/src/utils/transformers";

const REGISTRY_KIND_TO_ALIAS = {
  components: "components",
  ui: "ui",
  lib: "lib",
  hooks: "hooks",
  providers: "providers",
  themes: "themes",
} as const;

type ImportAliasKey =
  (typeof REGISTRY_KIND_TO_ALIAS)[keyof typeof REGISTRY_KIND_TO_ALIAS];

export const transformImport: Transformer = async ({ sourceFile, config }) => {
  if (![".tsx", ".ts", ".jsx", ".js"].includes(sourceFile.getExtension())) {
    return sourceFile;
  }

  for (const specifier of sourceFile.getImportStringLiterals()) {
    specifier.setLiteralValue(
      updateImportAlias(specifier.getLiteralValue(), config)
    );
  }

  return sourceFile;
};

function updateImportAlias(moduleSpecifier: string, config: Config) {
  if (moduleSpecifier === "@/registry") {
    return getImportAlias(config, "components");
  }

  if (moduleSpecifier.startsWith("@/registry/")) {
    const segments = moduleSpecifier.slice("@/registry/".length).split("/");
    const kindIndex = segments.findIndex(
      (segment) => segment in REGISTRY_KIND_TO_ALIAS
    );

    if (kindIndex === -1) {
      return moduleSpecifier;
    }

    const kind = segments[kindIndex] as keyof typeof REGISTRY_KIND_TO_ALIAS;
    const alias = getImportAlias(config, REGISTRY_KIND_TO_ALIAS[kind]);
    const rest = segments.slice(kindIndex + 1).join("/");

    return rest ? `${alias}/${rest}` : alias;
  }

  const consumerAliases: Array<[prefix: string, key: ImportAliasKey]> = [
    ["@/lib/terminal-themes", "themes"],
    ["@/components/ui", "ui"],
    ["@/components", "components"],
    ["@/providers", "providers"],
    ["@/hooks", "hooks"],
    ["@/lib", "lib"],
  ];

  for (const [prefix, key] of consumerAliases) {
    if (
      moduleSpecifier === prefix ||
      moduleSpecifier.startsWith(`${prefix}/`)
    ) {
      return moduleSpecifier.replace(prefix, getImportAlias(config, key));
    }
  }

  return moduleSpecifier;
}

function getImportAlias(config: Config, key: ImportAliasKey): string {
  const configured = config.aliases[key];

  if (configured) {
    return configured;
  }

  const components = config.aliases.components;
  const root = components.endsWith("/components")
    ? components.slice(0, -"/components".length)
    : components.split("/").slice(0, -1).join("/");

  const fallbacks: Record<Exclude<ImportAliasKey, "components">, string> = {
    ui: `${components}/ui`,
    lib: `${root}/lib`,
    hooks: `${root}/hooks`,
    providers: `${root}/providers`,
    themes: `${root}/lib/terminal-themes`,
  };

  return key === "components" ? components : fallbacks[key];
}
