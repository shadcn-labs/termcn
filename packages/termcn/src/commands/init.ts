import { promises as fs } from "node:fs";
import path from "node:path";

import { Command } from "commander";
import { execa } from "execa";
import prompts from "prompts";
import { z } from "zod";

import {
  DEFAULT_PROJECT_CONFIG,
  FRAMEWORK_NAMES,
  FRAMEWORKS,
  getThemeExportName,
  NERD_FONT_NAMES,
  NERD_FONTS,
  NERD_ICON_SET_NAMES,
  NERD_ICON_SETS,
  TEMPLATE_NAMES,
  TEMPLATES,
  THEME_NAMES,
  THEMES,
  type FrameworkName,
  type NerdFontName,
  type NerdIconSetName,
  type TemplateName,
  type ThemeName,
} from "@/src/config";
import {
  getNerdFont,
  getNerdFontDownloadUrl,
  getNerdIconSet,
} from "@/src/nerd-fonts";
import { REGISTRY_URL } from "@/src/registry/constants";
import { addComponents } from "@/src/utils/add-components";
import { getConfig, type Config } from "@/src/utils/get-config";
import { getPackageManager } from "@/src/utils/get-package-manager";
import { handleError } from "@/src/utils/handle-error";
import { highlighter } from "@/src/utils/highlighter";
import { logger } from "@/src/utils/logger";
import { spinner } from "@/src/utils/spinner";

export const initOptionsSchema = z.object({
  base: z.string().optional(),
  components: z.array(z.string()).optional(),
  cssVariables: z.boolean().default(false),
  cwd: z.string(),
  defaults: z.boolean(),
  existingConfig: z.record(z.unknown()).optional(),
  force: z.boolean(),
  font: z.enum(NERD_FONT_NAMES).optional(),
  framework: z.enum(FRAMEWORK_NAMES).optional(),
  iconLibrary: z.string().optional(),
  icons: z.enum(NERD_ICON_SET_NAMES).optional(),
  installStyleIndex: z.boolean().default(false),
  isNewProject: z.boolean().default(false),
  menuAccent: z.string().optional(),
  menuColor: z.string().optional(),
  monorepo: z.boolean().optional(),
  name: z.string().optional(),
  pointer: z.boolean().optional(),
  preset: z.union([z.boolean(), z.string()]).optional(),
  registryBaseConfig: z.record(z.unknown()).optional(),
  reinstall: z.boolean().optional(),
  rtl: z.boolean().optional(),
  silent: z.boolean(),
  skipPreflight: z.boolean().optional(),
  template: z.string().optional(),
  theme: z.string().optional(),
  tsx: z.boolean().default(true),
  yes: z.boolean(),
});

type InitOptions = z.infer<typeof initOptionsSchema>;

export const init = new Command()
  .name("init")
  .alias("create")
  .description("initialize a termcn project and install its terminal theme")
  .option(
    "-F, --framework <framework>",
    "the terminal framework to use. (ink, opentui)"
  )
  .option(
    "-b, --base <framework>",
    "alias for --framework, kept for shadcn-compatible workflows"
  )
  .option(
    "-t, --template <template>",
    `the starter template to install. (${TEMPLATE_NAMES.join(", ")})`
  )
  .option(
    "--theme <theme>",
    `the terminal theme to install. (${THEME_NAMES.join(", ")})`
  )
  .option(
    "--font <font>",
    `the required Nerd Font Mono family. (${NERD_FONT_NAMES.join(", ")})`
  )
  .option(
    "--icons <icons>",
    `the Nerd Font icon set to generate. (${NERD_ICON_SET_NAMES.join(", ")})`
  )
  .option("-n, --name <name>", "create the project in a new directory")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-y, --yes", "skip confirmation prompts.", false)
  .option("-d, --defaults", "use the default Ink configuration.", false)
  .option("-f, --force", "overwrite an existing components.json.", false)
  .option("-s, --silent", "mute progress output.", false)
  .option("--tsx", "write TypeScript and TSX files.", true)
  .option("--no-tsx", "write JavaScript and JSX files.")
  .argument("[components...]", "additional registry components to install")
  .action(async (components, opts) => {
    try {
      await runInit({
        ...opts,
        components,
        cwd: path.resolve(opts.cwd),
        framework: opts.framework ?? opts.base,
      });
    } catch (error) {
      handleError(error);
    }
  });

export async function runInit(
  input: Partial<InitOptions> & Pick<InitOptions, "cwd">
): Promise<Config> {
  const options = initOptionsSchema.parse({
    components: [],
    defaults: false,
    force: false,
    isNewProject: false,
    silent: false,
    tsx: true,
    yes: false,
    ...input,
    cwd: path.resolve(input.cwd),
  });

  const selection = await resolveSelection(options);
  const target = options.name
    ? path.resolve(options.cwd, options.name)
    : options.cwd;

  await fs.mkdir(target, { recursive: true });

  const componentsJsonPath = path.join(target, "components.json");
  if ((await pathExists(componentsJsonPath)) && !options.force) {
    if (options.yes || options.defaults) {
      throw new Error(
        `A ${highlighter.info("components.json")} file already exists. Use ${highlighter.info("--force")} to overwrite it.`
      );
    }

    const { overwrite } = await prompts({
      type: "confirm",
      name: "overwrite",
      message: "components.json already exists. Overwrite it?",
      initial: false,
    });

    if (!overwrite) {
      throw new Error("Initialization cancelled.");
    }
  }

  const isNewProject = !(await pathExists(path.join(target, "package.json")));
  if (isNewProject) {
    await scaffoldProject({
      framework: selection.framework,
      name: options.name ?? path.basename(target),
      target,
      theme: selection.theme,
      tsx: options.tsx,
    });
  } else {
    await ensureTypeScriptAliases(target);
  }

  await writeNerdFontSupport({
    font: selection.font,
    force: options.force || isNewProject,
    framework: selection.framework,
    icons: selection.icons,
    target,
    tsx: options.tsx,
  });

  await writeJson(componentsJsonPath, {
    $schema: "https://termcn.dev/schema.json",
    font: selection.font,
    icons: selection.icons,
    style: selection.framework,
    rsc: false,
    tsx: options.tsx,
    tailwind: {
      config: "",
      css: "",
      baseColor: "",
      cssVariables: false,
      prefix: "",
    },
    aliases: {
      components: "@/components",
      hooks: "@/hooks",
      lib: "@/lib",
      ui: "@/components/ui",
      utils: "@/lib/utils",
    },
    registries: {},
    theme: selection.theme,
    template: selection.template,
  });

  const config = await getConfig(target);
  if (!config) {
    throw new Error(
      `Unable to read the generated ${highlighter.info("components.json")}.`
    );
  }

  const registryItems = [
    registryItemUrl(selection.framework, `theme-${selection.theme}`),
    ...(selection.template === "blank"
      ? []
      : [registryItemUrl(selection.framework, selection.template)]),
    ...(options.components ?? []).map((item) =>
      normalizeRegistryItem(item, selection.framework)
    ),
  ];

  await addComponents(registryItems, config, {
    interactive: !options.yes && !options.defaults,
    isNewProject,
    overwrite: options.force,
    silent: options.silent,
    skipFonts: true,
  });

  if (isNewProject) {
    const packageManager = await getPackageManager(target, {
      withFallback: true,
    });
    const installSpinner = spinner("Installing project dependencies.", {
      silent: options.silent,
    })?.start();

    await execa(packageManager, ["install"], {
      cwd: target,
      stdio: options.silent ? "ignore" : "inherit",
    });
    installSpinner?.succeed();
  }

  if (!options.silent) {
    logger.break();
    logger.log(
      `${highlighter.success("Success!")} Initialized ${highlighter.info(selection.framework)} with the ${highlighter.info(selection.theme)} theme.`
    );
    logger.log(
      `Configuration written to ${highlighter.info(path.relative(process.cwd(), componentsJsonPath) || "components.json")}.`
    );
    logger.log(
      `Configure your terminal to use ${highlighter.info(getNerdFont(selection.font).family)}. Download: ${highlighter.info(getNerdFontDownloadUrl(selection.font))}`
    );
    if (isNewProject) {
      logger.log(
        `Run ${highlighter.info(`cd ${path.relative(options.cwd, target) || "."}`)} and ${highlighter.info(selection.framework === "opentui" ? "bun run dev" : "npm run dev")}.`
      );
    }
    logger.break();
  }

  return config;
}

async function resolveSelection(options: InitOptions) {
  if (options.defaults) {
    return DEFAULT_PROJECT_CONFIG;
  }

  let framework = parseFramework(options.framework ?? options.base);
  let theme = parseTheme(options.theme);
  let font = parseNerdFont(options.font);
  let icons = parseNerdIconSet(options.icons);
  let template = parseTemplate(options.template);

  if (!options.yes) {
    const answers = await prompts([
      {
        type: framework ? null : "select",
        name: "framework",
        message: "Which terminal framework would you like to use?",
        choices: FRAMEWORKS.map((entry) => ({
          title: entry.title,
          description: entry.description,
          value: entry.name,
        })),
        initial: 0,
      },
      {
        type: theme ? null : "autocomplete",
        name: "theme",
        message: "Which terminal theme would you like to use?",
        choices: THEMES.map((entry) => ({
          title: entry.title,
          value: entry.name,
        })),
        initial: 0,
      },
      {
        type: font ? null : "autocomplete",
        name: "font",
        message: "Which Nerd Font Mono family will your terminal use?",
        choices: NERD_FONTS.map((entry) => ({
          title: entry.title,
          description: entry.description,
          value: entry.name,
        })),
        initial: 0,
      },
      {
        type: icons ? null : "select",
        name: "icons",
        message: "Which Nerd Font icon set would you like to generate?",
        choices: NERD_ICON_SETS.map((entry) => ({
          title: entry.title,
          description: entry.description,
          value: entry.name,
        })),
        initial: 0,
      },
      {
        type: template ? null : "select",
        name: "template",
        message: "Which starter template would you like to install?",
        choices: TEMPLATES.map((entry) => ({
          title: entry.title,
          description: entry.description,
          value: entry.name,
        })),
        initial: 0,
      },
    ]);

    framework = framework ?? answers.framework;
    theme = theme ?? answers.theme;
    font = font ?? answers.font;
    icons = icons ?? answers.icons;
    template = template ?? answers.template;
  }

  return {
    font: font ?? DEFAULT_PROJECT_CONFIG.font,
    framework: framework ?? DEFAULT_PROJECT_CONFIG.framework,
    icons: icons ?? DEFAULT_PROJECT_CONFIG.icons,
    template: template ?? DEFAULT_PROJECT_CONFIG.template,
    theme: theme ?? DEFAULT_PROJECT_CONFIG.theme,
  };
}

function parseNerdFont(value?: string): NerdFontName | undefined {
  if (!value) return undefined;
  if (NERD_FONT_NAMES.includes(value as NerdFontName)) {
    return value as NerdFontName;
  }
  throw new Error(
    `Invalid font ${highlighter.info(value)}. Choose one of: ${NERD_FONT_NAMES.join(", ")}.`
  );
}

function parseNerdIconSet(value?: string): NerdIconSetName | undefined {
  if (!value) return undefined;
  if (NERD_ICON_SET_NAMES.includes(value as NerdIconSetName)) {
    return value as NerdIconSetName;
  }
  throw new Error(
    `Invalid icon set ${highlighter.info(value)}. Choose one of: ${NERD_ICON_SET_NAMES.join(", ")}.`
  );
}

function parseFramework(value?: string): FrameworkName | undefined {
  if (!value) return undefined;
  if (FRAMEWORK_NAMES.includes(value as FrameworkName)) {
    return value as FrameworkName;
  }
  throw new Error(
    `Invalid framework ${highlighter.info(value)}. Choose one of: ${FRAMEWORK_NAMES.join(", ")}.`
  );
}

function parseTheme(value?: string): ThemeName | undefined {
  if (!value) return undefined;
  if (THEME_NAMES.includes(value as ThemeName)) {
    return value as ThemeName;
  }
  throw new Error(
    `Invalid theme ${highlighter.info(value)}. Choose one of: ${THEME_NAMES.join(", ")}.`
  );
}

function parseTemplate(value?: string): TemplateName | undefined {
  if (!value) return undefined;
  if (TEMPLATE_NAMES.includes(value as TemplateName)) {
    return value as TemplateName;
  }
  throw new Error(
    `Invalid template ${highlighter.info(value)}. Choose one of: ${TEMPLATE_NAMES.join(", ")}.`
  );
}

function registryItemUrl(framework: FrameworkName, item: string) {
  return `${REGISTRY_URL}/${framework}/${item}.json`;
}

function normalizeRegistryItem(item: string, framework: FrameworkName) {
  if (
    item.startsWith("http://") ||
    item.startsWith("https://") ||
    item.startsWith("@")
  ) {
    return item;
  }

  return registryItemUrl(framework, item.replace(/\.json$/, ""));
}

async function scaffoldProject({
  framework,
  name,
  target,
  theme,
  tsx,
}: {
  framework: FrameworkName;
  name: string;
  target: string;
  theme: ThemeName;
  tsx: boolean;
}) {
  const extension = tsx ? "tsx" : "jsx";
  const sourceDir = path.join(target, "src");
  await fs.mkdir(sourceDir, { recursive: true });

  const packageJson =
    framework === "opentui"
      ? {
          name,
          private: true,
          type: "module",
          scripts: {
            build: `bun build src/index.${extension} --outdir dist --target bun --packages external`,
            dev: `bun --watch src/index.${extension}`,
            start: `bun src/index.${extension}`,
          },
          dependencies: {
            "@opentui/core": "latest",
            "@opentui/react": "latest",
            react: "^19.2.0",
          },
          devDependencies: {
            "@types/bun": "latest",
            "@types/react": "^19.2.0",
            typescript: "^5.9.0",
          },
        }
      : {
          name,
          private: true,
          type: "module",
          scripts: {
            build: "tsc --noEmit",
            dev: `tsx watch src/index.${extension}`,
            start: `tsx src/index.${extension}`,
          },
          dependencies: {
            ink: "^6.8.0",
            react: "^19.2.0",
          },
          devDependencies: {
            "@types/node": "^24.0.0",
            "@types/react": "^19.2.0",
            tsx: "^4.20.0",
            typescript: "^5.9.0",
          },
          engines: {
            node: ">=20.18.0",
          },
        };

  await Promise.all([
    writeJson(path.join(target, "package.json"), packageJson),
    writeJson(path.join(target, "tsconfig.json"), {
      compilerOptions: {
        baseUrl: ".",
        esModuleInterop: true,
        jsx: "react-jsx",
        ...(framework === "opentui"
          ? { jsxImportSource: "@opentui/react" }
          : {}),
        lib: ["ESNext", "DOM"],
        module: "ESNext",
        moduleResolution: "bundler",
        noEmit: true,
        paths: {
          "@/*": ["./src/*"],
        },
        skipLibCheck: true,
        strict: true,
        target: "ESNext",
      },
      include: ["src/**/*"],
    }),
    fs.writeFile(
      path.join(sourceDir, `index.${extension}`),
      getStarterSource(framework, theme),
      "utf8"
    ),
  ]);
}

async function ensureTypeScriptAliases(target: string) {
  const tsconfigPath = path.join(target, "tsconfig.json");
  if (!(await pathExists(tsconfigPath))) {
    await writeJson(tsconfigPath, {
      compilerOptions: {
        baseUrl: ".",
        jsx: "react-jsx",
        module: "ESNext",
        moduleResolution: "bundler",
        paths: {
          "@/*": ["./src/*"],
        },
        target: "ESNext",
      },
      include: ["src/**/*"],
    });
    return;
  }

  try {
    const contents = await fs.readFile(tsconfigPath, "utf8");
    const tsconfig = JSON.parse(contents);
    tsconfig.compilerOptions ??= {};
    tsconfig.compilerOptions.baseUrl ??= ".";
    tsconfig.compilerOptions.paths ??= {};
    tsconfig.compilerOptions.paths["@/*"] ??= ["./src/*"];
    await writeJson(tsconfigPath, tsconfig);
  } catch {
    // Keep JSONC and extended configurations intact. getConfig will use their
    // existing aliases and report a focused error if none can be resolved.
  }
}

function getStarterSource(framework: FrameworkName, theme: ThemeName) {
  const themeExport = getThemeExportName(theme);

  if (framework === "opentui") {
    return `/** @jsxImportSource @opentui/react */
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"

import { NerdIcon } from "@/components/ui/nerd-icon"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { ${themeExport} } from "@/lib/terminal-themes/${theme}"

function App() {
  return (
    <ThemeProvider theme={${themeExport}}>
      <box
        alignItems="center"
        border
        borderColor={${themeExport}.colors.border}
        flexDirection="column"
        height="100%"
        justifyContent="center"
        width="100%"
      >
        <box alignItems="center" flexDirection="row" gap={1}>
          <NerdIcon fg={${themeExport}.colors.primary} name="terminal" />
          <text fg={${themeExport}.colors.primary}>Welcome to termcn</text>
        </box>
        <text fg={${themeExport}.colors.mutedForeground}>
          Edit src/index.tsx to start building.
        </text>
      </box>
    </ThemeProvider>
  )
}

const renderer = await createCliRenderer({ exitOnCtrlC: true })
createRoot(renderer).render(<App />)
`;
  }

  return `import React from "react"
import { Box, render, Text } from "ink"

import { NerdIcon } from "@/components/ui/nerd-icon"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { ${themeExport} } from "@/lib/terminal-themes/${theme}"

function App() {
  return (
    <ThemeProvider theme={${themeExport}}>
      <Box
        alignItems="center"
        borderColor={${themeExport}.colors.border}
        borderStyle="round"
        flexDirection="column"
        paddingX={2}
        paddingY={1}
      >
        <Box columnGap={1}>
          <NerdIcon color={${themeExport}.colors.primary} name="terminal" />
          <Text color={${themeExport}.colors.primary}>Welcome to termcn</Text>
        </Box>
        <Text color={${themeExport}.colors.mutedForeground}>
          Edit src/index.tsx to start building.
        </Text>
      </Box>
    </ThemeProvider>
  )
}

render(<App />)
`;
}

async function writeNerdFontSupport({
  font,
  force,
  framework,
  icons,
  target,
  tsx,
}: {
  font: NerdFontName;
  force: boolean;
  framework: FrameworkName;
  icons: NerdIconSetName;
  target: string;
  tsx: boolean;
}) {
  const sourceDir = path.join(target, "src");
  const libDir = path.join(sourceDir, "lib");
  const uiDir = path.join(sourceDir, "components", "ui");
  const scriptExtension = tsx ? "ts" : "js";
  const componentExtension = tsx ? "tsx" : "jsx";

  await Promise.all([
    fs.mkdir(libDir, { recursive: true }),
    fs.mkdir(uiDir, { recursive: true }),
  ]);

  await Promise.all([
    writeFileIfAllowed(
      path.join(libDir, `nerd-font.${scriptExtension}`),
      getNerdFontConfigSource(font, icons, tsx),
      force
    ),
    writeFileIfAllowed(
      path.join(uiDir, `nerd-icon.${componentExtension}`),
      getNerdIconComponentSource(framework, tsx),
      force
    ),
  ]);
}

function getNerdFontConfigSource(
  fontName: NerdFontName,
  iconSetName: NerdIconSetName,
  tsx: boolean
) {
  const font = getNerdFont(fontName);
  const iconSet = getNerdIconSet(iconSetName);
  const constAssertion = tsx ? " as const" : "";
  const types = tsx
    ? `
export type NerdIconName = keyof typeof NERD_ICONS
`
    : "";

  return `/**
 * Generated by termcn from Nerd Fonts v3.4.0.
 * Configure your terminal to use "${font.family}" before rendering these glyphs.
 * ${getNerdFontDownloadUrl(fontName)}
 */
export const NERD_FONT = ${JSON.stringify(
    {
      family: font.family,
      name: font.name,
      title: font.title,
    },
    null,
    2
  )}${constAssertion}

export const NERD_ICON_SET = ${JSON.stringify(iconSetName)}${constAssertion}

export const NERD_ICONS = ${JSON.stringify(iconSet.glyphs, null, 2)}${constAssertion}
${types}`;
}

function getNerdIconComponentSource(framework: FrameworkName, tsx: boolean) {
  if (framework === "opentui") {
    const props = tsx
      ? `export interface NerdIconProps {
  fallback?: string
  fg?: string
  name: NerdIconName
}

`
      : "";
    const annotation = tsx ? ": NerdIconProps" : "";
    return `/** @jsxImportSource @opentui/react */
import { NERD_ICONS${tsx ? ", type NerdIconName" : ""} } from "@/lib/nerd-font"

${props}export function NerdIcon({ fallback = "?", fg, name }${annotation}) {
  return <text fg={fg}>{NERD_ICONS[name] ?? fallback}</text>
}
`;
  }

  const props = tsx
    ? `export interface NerdIconProps extends Omit<TextProps, "children"> {
  fallback?: string
  name: NerdIconName
}

`
    : "";
  const textPropsImport = tsx ? ", type TextProps" : "";
  const iconNameImport = tsx ? ", type NerdIconName" : "";
  const annotation = tsx ? ": NerdIconProps" : "";
  return `import React from "react"
import { Text${textPropsImport} } from "ink"

import { NERD_ICONS${iconNameImport} } from "@/lib/nerd-font"

${props}export function NerdIcon({ fallback = "?", name, ...props }${annotation}) {
  return <Text {...props}>{NERD_ICONS[name] ?? fallback}</Text>
}
`;
}

async function writeFileIfAllowed(
  filePath: string,
  contents: string,
  force: boolean
) {
  if (!force && (await pathExists(filePath))) {
    return;
  }
  await fs.writeFile(filePath, contents, "utf8");
}

async function writeJson(filePath: string, value: unknown) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function pathExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
