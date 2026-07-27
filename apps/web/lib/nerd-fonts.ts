export const NERD_FONTS_VERSION = "3.4.0";

export const NERD_FONTS = [
  {
    description: "A clear, compact typeface with programming ligatures.",
    family: '"Termcn JetBrains Mono Nerd Font"',
    name: "jetbrains-mono",
    title: "JetBrains Mono",
  },
  {
    description: "A popular programming font with extensive ligature support.",
    family: '"Termcn Fira Code Nerd Font"',
    name: "fira-code",
    title: "Fira Code",
  },
  {
    description: "A highly legible typeface designed specifically for source.",
    family: '"Termcn Hack Nerd Font"',
    name: "hack",
    title: "Hack",
  },
  {
    description: "A roomy Menlo derivative commonly used in terminal prompts.",
    family: '"Termcn Meslo Nerd Font"',
    name: "meslo",
    title: "Meslo",
  },
] as const;

export type NerdFontName = (typeof NERD_FONTS)[number]["name"];

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
] as const;

export type NerdIconSetName = (typeof NERD_ICON_SETS)[number]["name"];

export const getNerdFont = (name: NerdFontName) =>
  NERD_FONTS.find((font) => font.name === name) ?? NERD_FONTS[0];

export const getNerdIconSet = (name: NerdIconSetName) =>
  NERD_ICON_SETS.find((iconSet) => iconSet.name === name) ?? NERD_ICON_SETS[0];

export const getNerdFontStack = (name: NerdFontName) =>
  `${getNerdFont(name).family}, "NerdFontsSymbols Nerd Font", monospace`;
