import "server-only";
import { SITE } from "@/constants/site";
import { fetchProText, ProSourceError } from "@/lib/pro-github";

interface RegistryFile {
  path: string;
  target?: string;
  type: string;
}

interface RegistryItem {
  categories?: string[];
  dependencies?: string[];
  description?: string;
  files: RegistryFile[];
  name: string;
  registryDependencies?: string[];
  title?: string;
  type: string;
}

interface Registry {
  $schema?: string;
  homepage?: string;
  items: RegistryItem[];
}

const REGISTRY_PATH = "apps/web/registry.json";
const REGISTRY_SOURCE_ROOT = "apps/web/registry/";

const parseRegistry = (source: string): Registry => {
  const registry = JSON.parse(source) as Partial<Registry>;
  if (!Array.isArray(registry.items)) {
    throw new ProSourceError("Private registry manifest is invalid");
  }
  return registry as Registry;
};

export const getProRegistry = async (): Promise<Registry> => {
  const registry = parseRegistry(await fetchProText(REGISTRY_PATH));
  return { ...registry, homepage: `${SITE.URL}/pro` };
};

export const getProRegistryItem = async (
  itemName: string
): Promise<(RegistryItem & { $schema: string }) | null> => {
  const registry = await getProRegistry();
  const item = registry.items.find((candidate) => candidate.name === itemName);
  if (!item) {
    return null;
  }
  if (!Array.isArray(item.files)) {
    throw new ProSourceError("Private registry item has invalid files");
  }

  const files = await Promise.all(
    item.files.map(async (file) => {
      const sourcePath = `apps/web/${file.path}`;
      if (!sourcePath.startsWith(REGISTRY_SOURCE_ROOT)) {
        throw new ProSourceError(
          `Registry source is outside its root: ${file.path}`
        );
      }
      return {
        ...file,
        content: await fetchProText(sourcePath),
      };
    })
  );

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    ...item,
    files,
  };
};
