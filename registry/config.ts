import { z } from "zod";

import { BASE_NAMES, BASES, DEFAULT_BASE_NAME } from "@/registry/bases";
import type { Base, BaseName } from "@/registry/bases";
import { getThemesForBase, THEMES, THEME_NAMES } from "@/registry/themes";
import type { RegistryTheme, RegistryThemeName } from "@/registry/themes";

export { BASES, type Base, type BaseName, DEFAULT_BASE_NAME };
export { THEMES, type RegistryTheme, type RegistryThemeName };

export const registryConfigSchema = z.object({
  base: z.enum(BASE_NAMES).default(DEFAULT_BASE_NAME),
  theme: z.enum(THEME_NAMES).default("default"),
});

export type RegistryConfig = z.infer<typeof registryConfigSchema>;

export const DEFAULT_REGISTRY_CONFIG: RegistryConfig = {
  base: DEFAULT_BASE_NAME,
  theme: "default",
};

export const isThemeAvailableForBase = (
  base: BaseName,
  theme: RegistryThemeName
) => getThemesForBase(base).some((entry) => entry.name === theme);

export const getRegistryConfig = (config?: Partial<RegistryConfig>) => {
  const resolved = registryConfigSchema.parse(config ?? {});

  if (!isThemeAvailableForBase(resolved.base, resolved.theme)) {
    return {
      ...resolved,
      theme: DEFAULT_REGISTRY_CONFIG.theme,
    };
  }

  return resolved;
};
