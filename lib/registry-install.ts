import { SITE } from "@/constants/site";

export type RegistryBase = "ink" | "opentui";

export const REGISTRY_ORIGIN = `${SITE.URL}/r`;

const LEGACY_OPENTUI_PREFIX = "opentui-";

export const getRegistryItemPath = (base: RegistryBase, slug: string): string =>
  `${base}/${slug}`;

export const getRegistryInstallSlug = (
  base: RegistryBase,
  slug: string
): string => getRegistryItemPath(base, slug);

export const getThemeInstallSlug = (
  base: RegistryBase,
  themeSlug: string
): string => getRegistryInstallSlug(base, `theme-${themeSlug}`);

export const getRegistryInstallRef = (
  base: RegistryBase,
  slug: string
): string => `${SITE.REGISTRY}/${getRegistryInstallSlug(base, slug)}`;

export const getThemeInstallRef = (
  base: RegistryBase,
  themeSlug: string
): string => getRegistryInstallRef(base, `theme-${themeSlug}`);

export const getRegistryItemUrl = (base: RegistryBase, slug: string): string =>
  `${REGISTRY_ORIGIN}/${getRegistryItemPath(base, slug)}.json`;

export const resolveLegacyInstallSlug = (legacySlug: string): string => {
  if (legacySlug.startsWith(LEGACY_OPENTUI_PREFIX)) {
    return getRegistryInstallSlug(
      "opentui",
      legacySlug.slice(LEGACY_OPENTUI_PREFIX.length)
    );
  }

  return getRegistryInstallSlug("ink", legacySlug);
};

export const resolveDocInstallSlug = (parsed: {
  base?: string;
  kind: "component" | "template" | "theme";
  slug: string;
}): string => {
  if (parsed.kind === "theme") {
    return getThemeInstallSlug(
      parsed.base === "opentui" ? "opentui" : "ink",
      parsed.slug
    );
  }

  const base: RegistryBase = parsed.base === "opentui" ? "opentui" : "ink";
  return getRegistryInstallSlug(base, parsed.slug);
};
