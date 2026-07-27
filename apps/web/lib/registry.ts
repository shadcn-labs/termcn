import path from "node:path";

import { readFileFromRoot } from "@/lib/read-file";
import { DEFAULT_BASE_NAME } from "@/registry/bases";
import type { BaseName } from "@/registry/bases";

const readOptional = async (relativePath: string): Promise<string | null> => {
  try {
    return await readFileFromRoot(relativePath);
  } catch {
    return null;
  }
};

export const getRegistryUiSourceCandidates = ({
  base,
  name,
}: {
  base?: BaseName;
  name: string;
}) => {
  const candidates: string[] = base
    ? [path.join("registry", "bases", base, "ui", `${name}.tsx`)]
    : [];

  return [...new Set(candidates)];
};

export const getDemoSource = (
  name: string,
  base: BaseName = DEFAULT_BASE_NAME
): Promise<string | null> =>
  readOptional(path.join("examples", base, `${name}.tsx`));

export const getRegistrySource = async (
  name: string,
  base?: BaseName
): Promise<string | null> => {
  const candidates = getRegistryUiSourceCandidates({ base, name });

  for (const candidate of candidates) {
    const code = await readOptional(candidate);
    if (code) {
      return code;
    }
  }

  return null;
};
