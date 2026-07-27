import { describe, expect, it } from "vitest";

import {
  getNerdFont,
  getNerdFontDownloadUrl,
  getNerdFontInstallCommand,
  getNerdIconSet,
  NERD_FONT_NAMES,
  NERD_FONTS_VERSION,
  NERD_ICON_NAMES,
  NERD_ICON_SET_NAMES,
} from "./index";

describe("Nerd Fonts configuration", () => {
  it("keeps unique font and icon-set slugs", () => {
    expect(new Set(NERD_FONT_NAMES).size).toBe(NERD_FONT_NAMES.length);
    expect(new Set(NERD_ICON_SET_NAMES).size).toBe(NERD_ICON_SET_NAMES.length);
  });

  it("provides every semantic glyph in every icon set", () => {
    for (const iconSetName of NERD_ICON_SET_NAMES) {
      const iconSet = getNerdIconSet(iconSetName);
      expect(Object.keys(iconSet.glyphs).sort()).toEqual(
        [...NERD_ICON_NAMES].sort()
      );

      for (const glyph of Object.values(iconSet.glyphs)) {
        expect([...glyph]).toHaveLength(1);
      }
    }
  });

  it("generates official release and Homebrew installation targets", () => {
    expect(getNerdFontDownloadUrl("jetbrains-mono")).toBe(
      `https://github.com/ryanoasis/nerd-fonts/releases/download/v${NERD_FONTS_VERSION}/JetBrainsMono.tar.xz`
    );
    expect(getNerdFontInstallCommand("hack")).toBe(
      "brew install --cask font-hack-nerd-font"
    );
    expect(getNerdFont("meslo").family).toBe("MesloLGM Nerd Font Mono");
  });
});
