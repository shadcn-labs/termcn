import Link from "next/link";

import type { BaseName } from "@/registry/bases";
import { THEMES as INK_THEMES } from "@/registry/bases/ink/themes";
import type { RegistryThemeName as InkThemeName } from "@/registry/bases/ink/themes";
import { THEMES as OPENTUI_THEMES } from "@/registry/bases/opentui/themes";
import type { RegistryThemeName as OpenTuiThemeName } from "@/registry/bases/opentui/themes";

type RegistryThemeName = InkThemeName | OpenTuiThemeName;

interface ThemePreviewGridProps {
  base?: BaseName;
  themes?: readonly RegistryThemeName[];
}

export const ThemePreviewGrid = ({
  base = "ink",
  themes: requestedThemes,
}: ThemePreviewGridProps) => {
  const registryThemes = base === "opentui" ? OPENTUI_THEMES : INK_THEMES;
  const slugs = requestedThemes ?? registryThemes.map((theme) => theme.name);
  const themes = slugs
    .map((slug) => {
      const theme = registryThemes.find((item) => item.name === slug);
      if (!theme) {
        return null;
      }
      return {
        accent: theme.theme.colors.accent,
        muted: theme.theme.colors.muted,
        name: theme.title,
        primary: theme.theme.colors.primary,
        secondary: theme.theme.colors.secondary,
        slug: theme.name,
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  return (
    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-x-8 lg:gap-x-16 lg:gap-y-6 xl:gap-x-20">
      {themes.map((theme) => (
        <Link
          key={theme.slug}
          href={`/docs/themes/${base}/${theme.slug}`}
          className="inline-flex items-center gap-2 text-lg font-medium underline-offset-4 hover:underline md:text-base"
          transitionTypes={["nav-forward"]}
        >
          <div className="flex shrink-0 gap-0.5">
            {(["primary", "accent", "muted", "secondary"] as const).map(
              (color) => (
                <div
                  key={color}
                  className="flex h-4 w-2.5 shrink-0 rounded-xs inset-ring-1 inset-ring-foreground/15"
                  style={{ backgroundColor: theme[color] }}
                />
              )
            )}
          </div>
          <span className="truncate">{theme.name}</span>
        </Link>
      ))}
    </div>
  );
};
