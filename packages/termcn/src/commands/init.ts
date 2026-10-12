import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Command } from "commander";
import { execa } from "execa";
import prompts from "prompts";
import { z } from "zod";

import {
  DEFAULT_PROJECT_CONFIG,
  FRAMEWORK_NAMES,
  FRAMEWORKS,
  getThemeExportName,
  TEMPLATE_NAMES,
  TEMPLATES,
  THEME_NAMES,
  THEMES,
  type FrameworkName,
  type TemplateName,
  type ThemeName,
} from "@/src/config";
import { REGISTRY_URL } from "@/src/registry/constants";
import { addComponents } from "@/src/utils/add-components";
import { CONFIG_FILE, getConfig, type Config } from "@/src/utils/get-config";
import { getPackageManager } from "@/src/utils/get-package-manager";
import { handleError } from "@/src/utils/handle-error";
import { highlighter } from "@/src/utils/highlighter";
import { logger } from "@/src/utils/logger";
import { spinner } from "@/src/utils/spinner";

export const initOptionsSchema = z.object({
  components: z.array(z.string()).optional(),
  cwd: z.string(),
  defaults: z.boolean(),
  force: z.boolean(),
  framework: z.enum(FRAMEWORK_NAMES).optional(),
  name: z.string().optional(),
  silent: z.boolean(),
  template: z.string().optional(),
  theme: z.string().optional(),
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
    "-t, --template <template>",
    `the component preset to install. (${TEMPLATE_NAMES.join(", ")})`
  )
  .option(
    "--theme <theme>",
    `the terminal theme to install. (${THEME_NAMES.join(", ")})`
  )
  .option("-n, --name <name>", "create the project in a new directory")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-y, --yes", "skip confirmation prompts.", false)
  .option("-d, --defaults", "use the default Ink configuration.", false)
  .option("-f, --force", `overwrite an existing ${CONFIG_FILE}.`, false)
  .option("-s, --silent", "mute progress output.", false)
  .argument("[components...]", "additional registry components to install")
  .action(async (components, opts) => {
    try {
      await runInit({
        ...opts,
        components,
        cwd: path.resolve(opts.cwd),
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
    silent: false,
    yes: false,
    ...input,
    cwd: path.resolve(input.cwd),
  });
  const selection = await resolveSelection(options);
  const target = options.name
    ? path.resolve(options.cwd, options.name)
    : options.cwd;

  await fs.mkdir(target, { recursive: true });

  const configPath = path.join(target, CONFIG_FILE);
  if ((await pathExists(configPath)) && !options.force) {
    if (options.yes || options.defaults) {
      throw new Error(
        `A ${highlighter.info(CONFIG_FILE)} file already exists. Use ${highlighter.info("--force")} to overwrite it.`
      );
    }

    const { overwrite } = await prompts({
      type: "confirm",
      name: "overwrite",
      message: `${CONFIG_FILE} already exists. Overwrite it?`,
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
    });
  } else {
    await ensureTypeScriptAliases(target, selection.framework);
  }

  await writeJson(configPath, {
    $schema: "https://termcn.dev/schema.json",
    framework: selection.framework,
    theme: selection.theme,
    aliases: {
      components: "@/components",
      ui: "@/components/ui",
      lib: "@/lib",
      hooks: "@/hooks",
      providers: "@/providers",
      themes: "@/lib/terminal-themes",
    },
    registries: {},
  });

  const config = await getConfig(target);
  if (!config) {
    throw new Error(
      `Unable to read the generated ${highlighter.info(CONFIG_FILE)}.`
    );
  }

  const registryItems = [
    registryItemUrl(selection.framework, `theme-${selection.theme}`),
    registryItemUrl(selection.framework, "theme-provider"),
    ...(selection.template === "blank"
      ? []
      : [registryItemUrl(selection.framework, selection.template)]),
    ...(options.components ?? []).map((item) =>
      normalizeRegistryItem(item, selection.framework)
    ),
  ];

  await addComponents(registryItems, config, {
    interactive: !options.yes && !options.defaults,
    overwrite: options.force,
    silent: options.silent,
  });

  if (isNewProject) {
    const packageManager =
      selection.framework === "opentui"
        ? "bun"
        : await getPackageManager(target, { withFallback: true });
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
      `Configuration written to ${highlighter.info(path.relative(process.cwd(), configPath) || CONFIG_FILE)}.`
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

  let framework = parseFramework(options.framework);
  let theme = parseTheme(options.theme);
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
        type: template ? null : "select",
        name: "template",
        message: "Which component preset would you like to install?",
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
    template = template ?? answers.template;
  }

  return {
    framework: framework ?? DEFAULT_PROJECT_CONFIG.framework,
    template: template ?? DEFAULT_PROJECT_CONFIG.template,
    theme: theme ?? DEFAULT_PROJECT_CONFIG.theme,
  };
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
}: {
  framework: FrameworkName;
  name: string;
  target: string;
  theme: ThemeName;
}) {
  const templateDir = fileURLToPath(
    new URL(`./templates/${framework}/`, import.meta.url)
  );
  await fs.cp(templateDir, target, { recursive: true });

  const packagePath = path.join(target, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packagePath, "utf8"));
  packageJson.name = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  await writeJson(packagePath, packageJson);

  const entryPath = path.join(
    target,
    "src",
    framework === "opentui" ? "index.tsx" : "cli.tsx"
  );
  const source = await fs.readFile(entryPath, "utf8");
  const replacements: Record<string, string> = {
    "{{theme}}": theme,
    "{{themeExport}}": getThemeExportName(theme),
  };
  const rendered = Object.entries(replacements).reduce(
    (contents, [placeholder, value]) => contents.replaceAll(placeholder, value),
    source
  );
  await fs.writeFile(entryPath, rendered, "utf8");
}

async function ensureTypeScriptAliases(
  target: string,
  framework: FrameworkName
) {
  const tsconfigPath = path.join(target, "tsconfig.json");
  if (!(await pathExists(tsconfigPath))) {
    await writeJson(tsconfigPath, {
      compilerOptions: {
        baseUrl: ".",
        jsx: "react-jsx",
        ...(framework === "opentui"
          ? { jsxImportSource: "@opentui/react" }
          : {}),
        module: "ESNext",
        moduleResolution: "bundler",
        paths: { "@/*": ["./src/*"] },
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
    if (framework === "opentui") {
      tsconfig.compilerOptions.jsxImportSource ??= "@opentui/react";
    }
    await writeJson(tsconfigPath, tsconfig);
  } catch {
    // Preserve JSONC and inherited configs; getConfig reports unresolved aliases.
  }
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
