import { z } from "zod";

import {
  NERD_FONT_NAMES,
  NERD_FONTS,
  NERD_ICON_SET_NAMES,
  NERD_ICON_SETS,
  type NerdFontName,
  type NerdIconSetName,
} from "@/src/nerd-fonts";

export {
  NERD_FONT_NAMES,
  NERD_FONTS,
  NERD_FONTS_VERSION,
  NERD_ICON_NAMES,
  NERD_ICON_SET_NAMES,
  NERD_ICON_SETS,
  getNerdFont,
  getNerdFontDownloadUrl,
  getNerdFontInstallCommand,
  getNerdIconSet,
} from "@/src/nerd-fonts";
export type {
  NerdFontName,
  NerdIconGlyphs,
  NerdIconName,
  NerdIconSetName,
} from "@/src/nerd-fonts";

export const FRAMEWORKS = [
  {
    description: "React-powered terminal interfaces rendered with Ink.",
    name: "ink",
    title: "Ink",
  },
  {
    description:
      "High-performance React terminal interfaces rendered with OpenTUI.",
    name: "opentui",
    title: "OpenTUI",
  },
] as const;

export type FrameworkName = (typeof FRAMEWORKS)[number]["name"];

export const FRAMEWORK_NAMES = FRAMEWORKS.map(
  (framework) => framework.name
) as [FrameworkName, ...FrameworkName[]];

export const THEMES = [
  { name: "default", title: "Default" },
  { name: "catppuccin", title: "Catppuccin" },
  { name: "dracula", title: "Dracula" },
  { name: "high-contrast", title: "High Contrast" },
  { name: "high-contrast-light", title: "High Contrast Light" },
  { name: "monokai", title: "Monokai" },
  { name: "nord", title: "Nord" },
  { name: "one-dark", title: "One Dark" },
  { name: "solarized", title: "Solarized" },
  { name: "tokyo-night", title: "Tokyo Night" },
  { name: "amoled", title: "AMOLED" },
  { name: "aura", title: "Aura" },
  { name: "ayu", title: "Ayu" },
  { name: "carbonfox", title: "Carbonfox" },
  { name: "catppuccin-frappe", title: "Catppuccin Frappe" },
  { name: "catppuccin-macchiato", title: "Catppuccin Macchiato" },
  { name: "cobalt2", title: "Cobalt2" },
  { name: "cursor", title: "Cursor" },
  { name: "everforest", title: "Everforest" },
  { name: "flexoki", title: "Flexoki" },
  { name: "github", title: "GitHub" },
  { name: "gruvbox", title: "Gruvbox" },
  { name: "kanagawa", title: "Kanagawa" },
  { name: "lucent-orng", title: "Lucent Orng" },
  { name: "material", title: "Material" },
  { name: "matrix", title: "Matrix" },
  { name: "mercury", title: "Mercury" },
  { name: "nightowl", title: "Night Owl" },
  { name: "oc-2", title: "OC-2" },
  { name: "onedarkpro", title: "One Dark Pro" },
  { name: "opencode", title: "OpenCode" },
  { name: "orng", title: "Orng" },
  { name: "osaka-jade", title: "Osaka Jade" },
  { name: "palenight", title: "Palenight" },
  { name: "rosepine", title: "Rose Pine" },
  { name: "shadesofpurple", title: "Shades of Purple" },
  { name: "synthwave84", title: "Synthwave '84" },
  { name: "vercel", title: "Vercel" },
  { name: "vesper", title: "Vesper" },
  { name: "zenburn", title: "Zenburn" },
] as const;

export type ThemeName = (typeof THEMES)[number]["name"];

export const THEME_NAMES = THEMES.map((theme) => theme.name) as [
  ThemeName,
  ...ThemeName[],
];

export const TEMPLATES = [
  {
    description: "A minimal themed terminal application.",
    name: "blank",
    title: "Blank",
  },
  {
    description: "A full-screen layout with header, content, input, and hints.",
    name: "app-shell",
    title: "App Shell",
  },
  {
    description: "A structured command reference and keyboard shortcut screen.",
    name: "help-screen",
    title: "Help Screen",
  },
  {
    description: "A complete terminal onboarding and authentication flow.",
    name: "login-flow",
    title: "Login Flow",
  },
  {
    description: "A guided multi-step setup experience.",
    name: "setup-flow",
    title: "Setup Flow",
  },
  {
    description: "An ASCII-art startup screen with status messaging.",
    name: "splash-screen",
    title: "Splash Screen",
  },
  {
    description: "A real-time terminal metrics dashboard.",
    name: "usage-monitor",
    title: "Usage Monitor",
  },
  {
    description: "A two-panel welcome dashboard.",
    name: "welcome-screen",
    title: "Welcome Screen",
  },
] as const;

export type TemplateName = (typeof TEMPLATES)[number]["name"];

export const TEMPLATE_NAMES = TEMPLATES.map((template) => template.name) as [
  TemplateName,
  ...TemplateName[],
];

export const DEFAULT_PROJECT_CONFIG = {
  font: "jetbrains-mono",
  framework: "ink",
  icons: "codicons",
  template: "blank",
  theme: "default",
} as const satisfies {
  font: NerdFontName;
  framework: FrameworkName;
  icons: NerdIconSetName;
  template: TemplateName;
  theme: ThemeName;
};

export const projectConfigSchema = z.object({
  font: z.enum(NERD_FONT_NAMES).default(DEFAULT_PROJECT_CONFIG.font),
  framework: z.enum(FRAMEWORK_NAMES).default(DEFAULT_PROJECT_CONFIG.framework),
  icons: z.enum(NERD_ICON_SET_NAMES).default(DEFAULT_PROJECT_CONFIG.icons),
  template: z.enum(TEMPLATE_NAMES).default(DEFAULT_PROJECT_CONFIG.template),
  theme: z.enum(THEME_NAMES).default(DEFAULT_PROJECT_CONFIG.theme),
});

export type ProjectConfig = z.infer<typeof projectConfigSchema>;

export const PACKAGE_MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export function getThemeExportName(theme: ThemeName) {
  const [first = "default", ...rest] = theme.split("-");
  return `${first}${rest
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("")}Theme`;
}

export function buildInitCommand({
  font,
  framework,
  icons,
  name,
  packageManager = "pnpm",
  template,
  theme,
  version = "latest",
}: ProjectConfig & {
  name?: string;
  packageManager?: PackageManager;
  version?: string;
}) {
  const runner = {
    bun: `bunx --bun termcn@${version}`,
    npm: `npx termcn@${version}`,
    pnpm: `pnpm dlx termcn@${version}`,
    yarn: `yarn dlx termcn@${version}`,
  }[packageManager];

  const nameFlag = name ? ` --name ${name}` : "";

  return `${runner} init --framework ${framework} --theme ${theme} --font ${font} --icons ${icons} --template ${template}${nameFlag} --yes`;
}
