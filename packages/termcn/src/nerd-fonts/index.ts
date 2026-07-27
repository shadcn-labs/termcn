export const NERD_FONTS_VERSION = "3.4.0";

export const NERD_FONTS = [
  {
    archive: "JetBrainsMono",
    description: "A clear, compact typeface with programming ligatures.",
    family: "JetBrainsMono Nerd Font Mono",
    homebrew: "font-jetbrains-mono-nerd-font",
    name: "jetbrains-mono",
    title: "JetBrains Mono",
  },
  {
    archive: "FiraCode",
    description: "A popular programming font with extensive ligature support.",
    family: "FiraCode Nerd Font Mono",
    homebrew: "font-fira-code-nerd-font",
    name: "fira-code",
    title: "Fira Code",
  },
  {
    archive: "Hack",
    description: "A highly legible typeface designed specifically for source.",
    family: "Hack Nerd Font Mono",
    homebrew: "font-hack-nerd-font",
    name: "hack",
    title: "Hack",
  },
  {
    archive: "Meslo",
    description: "A roomy Menlo derivative commonly used in terminal prompts.",
    family: "MesloLGM Nerd Font Mono",
    homebrew: "font-meslo-lg-nerd-font",
    name: "meslo",
    title: "Meslo",
  },
] as const;

export type NerdFontName = (typeof NERD_FONTS)[number]["name"];

export const NERD_FONT_NAMES = NERD_FONTS.map((font) => font.name) as [
  NerdFontName,
  ...NerdFontName[],
];

export const NERD_ICON_NAMES = [
  "success",
  "error",
  "warning",
  "info",
  "terminal",
  "folder",
  "file",
  "rocket",
  "settings",
  "package",
] as const;

export type NerdIconName = (typeof NERD_ICON_NAMES)[number];
export type NerdIconGlyphs = Record<NerdIconName, string>;

export const NERD_ICON_SETS = [
  {
    description: "VS Code's compact interface glyphs.",
    glyphs: {
      error: "\u{EA87}",
      file: "\u{EA7B}",
      folder: "\u{EA83}",
      info: "\u{EA74}",
      package: "\u{EB29}",
      rocket: "\u{EB44}",
      settings: "\u{EB52}",
      success: "\u{EAB2}",
      terminal: "\u{EA85}",
      warning: "\u{EA6C}",
    },
    name: "codicons",
    title: "Codicons",
  },
  {
    description: "The familiar Font Awesome solid icon family.",
    glyphs: {
      error: "\u{F05C}",
      file: "\u{F15B}",
      folder: "\u{F07B}",
      info: "\u{F129}",
      package: "\u{F1B2}",
      rocket: "\u{F135}",
      settings: "\u{F013}",
      success: "\u{F00C}",
      terminal: "\u{F120}",
      warning: "\u{F071}",
    },
    name: "font-awesome",
    title: "Font Awesome",
  },
  {
    description: "Material Design icons with broad application coverage.",
    glyphs: {
      error: "\u{F0159}",
      file: "\u{F0214}",
      folder: "\u{F024B}",
      info: "\u{F02FC}",
      package: "\u{F03D6}",
      rocket: "\u{F14DE}",
      settings: "\u{F0493}",
      success: "\u{F012C}",
      terminal: "\u{F018D}",
      warning: "\u{F0026}",
    },
    name: "material",
    title: "Material Design",
  },
  {
    description: "GitHub's crisp developer-focused Octicons.",
    glyphs: {
      error: "\u{F52F}",
      file: "\u{F4A5}",
      folder: "\u{F413}",
      info: "\u{F449}",
      package: "\u{F487}",
      rocket: "\u{F427}",
      settings: "\u{F423}",
      success: "\u{F42E}",
      terminal: "\u{F489}",
      warning: "\u{F421}",
    },
    name: "octicons",
    title: "Octicons",
  },
] as const satisfies readonly {
  description: string;
  glyphs: NerdIconGlyphs;
  name: string;
  title: string;
}[];

export type NerdIconSetName = (typeof NERD_ICON_SETS)[number]["name"];

export const NERD_ICON_SET_NAMES = NERD_ICON_SETS.map(
  (iconSet) => iconSet.name
) as [NerdIconSetName, ...NerdIconSetName[]];

export function getNerdFont(name: NerdFontName) {
  return NERD_FONTS.find((font) => font.name === name) ?? NERD_FONTS[0];
}

export function getNerdIconSet(name: NerdIconSetName) {
  return (
    NERD_ICON_SETS.find((iconSet) => iconSet.name === name) ?? NERD_ICON_SETS[0]
  );
}

export function getNerdFontDownloadUrl(name: NerdFontName) {
  const font = getNerdFont(name);
  return `https://github.com/ryanoasis/nerd-fonts/releases/download/v${NERD_FONTS_VERSION}/${font.archive}.tar.xz`;
}

export function getNerdFontInstallCommand(name: NerdFontName) {
  return `brew install --cask ${getNerdFont(name).homebrew}`;
}
