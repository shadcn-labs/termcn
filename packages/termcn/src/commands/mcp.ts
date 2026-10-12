import { promises as fs } from "node:fs";
import path from "node:path";

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Command } from "commander";
import deepmerge from "deepmerge";
import { execa } from "execa";
import fsExtra from "fs-extra";
import prompts from "prompts";
import z from "zod";

import { server } from "@/src/mcp";
import { getConfig, type Config } from "@/src/utils/get-config";
import { getPackageManager } from "@/src/utils/get-package-manager";
import { handleError } from "@/src/utils/handle-error";
import { highlighter } from "@/src/utils/highlighter";
import { logger } from "@/src/utils/logger";
import { spinner } from "@/src/utils/spinner";
import { updateDependencies } from "@/src/utils/updaters/update-dependencies";

const TERMCN_MCP_VERSION = "latest";
const DEPENDENCIES = [`termcn@${TERMCN_MCP_VERSION}`];

const CLIENTS = [
  {
    name: "claude",
    label: "Claude Code",
    configPath: ".mcp.json",
    shape: "mcpServers",
  },
  {
    name: "cursor",
    label: "Cursor",
    configPath: ".cursor/mcp.json",
    shape: "mcpServers",
  },
  {
    name: "vscode",
    label: "VS Code",
    configPath: ".vscode/mcp.json",
    shape: "servers",
  },
  {
    name: "codex",
    label: "Codex",
    configPath: ".codex/config.toml",
    shape: "toml",
  },
  {
    name: "opencode",
    label: "OpenCode",
    configPath: "opencode.json",
    shape: "opencode",
  },
] as const;

export const mcp = new Command()
  .name("mcp")
  .description("MCP server and configuration commands")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .action(async () => {
    try {
      const transport = new StdioServerTransport();
      await server.connect(transport);
    } catch (error) {
      logger.break();
      handleError(error);
    }
  });

const mcpInitOptionsSchema = z.object({
  client: z.enum(["claude", "cursor", "vscode", "codex", "opencode"]),
  cwd: z.string(),
});

mcp
  .command("init")
  .description("initialize MCP configuration for your client")
  .option(
    "--client <client>",
    `MCP client (${CLIENTS.map((client) => client.name).join(", ")})`
  )
  .action(async (opts, command) => {
    try {
      const parentOpts = command.parent?.opts() || {};
      const cwd = parentOpts.cwd || process.cwd();
      let client = opts.client;

      if (!client) {
        const response = await prompts({
          type: "select",
          name: "client",
          message: "Which MCP client are you using?",
          choices: CLIENTS.map((entry) => ({
            title: entry.label,
            value: entry.name,
          })),
        });

        if (!response.client) {
          logger.break();
          process.exitCode = 1;
          return;
        }
        client = response.client;
      }

      const options = mcpInitOptionsSchema.parse({ client, cwd });
      const config = await getConfig(options.cwd);
      await installTermcnDependency(config, options.cwd);

      if (options.client === "codex") {
        logger.break();
        logger.log("To configure the termcn MCP server in Codex:");
        logger.break();
        logger.log(
          `1. Open or create ${highlighter.info("~/.codex/config.toml")}`
        );
        logger.log("2. Add:");
        logger.info(`[mcp_servers.termcn]
command = "npx"
args = ["termcn@${TERMCN_MCP_VERSION}", "mcp"]`);
        logger.break();
        logger.info("3. Restart Codex to load the MCP server");
        logger.break();
        return;
      }

      const configSpinner = spinner("Configuring MCP server...").start();
      const configPath = await runMcpInit(options);
      configSpinner.succeed("Configuring MCP server.");
      logger.break();
      logger.success(`Configuration saved to ${configPath}.`);
      logger.break();
    } catch (error) {
      handleError(error);
    }
  });

async function installTermcnDependency(config: Config | null, cwd: string) {
  if (config) {
    await updateDependencies([], DEPENDENCIES, config, { silent: false });
    return;
  }

  const packageManager = await getPackageManager(cwd);
  const installCommand = packageManager === "npm" ? "install" : "add";
  const devFlag = packageManager === "npm" ? "--save-dev" : "-D";
  const installSpinner = spinner("Installing dependencies...").start();
  await execa(packageManager, [installCommand, devFlag, ...DEPENDENCIES], {
    cwd,
  });
  installSpinner.succeed("Installing dependencies.");
}

const overwriteMerge = (_target: unknown[], source: unknown[]) => source;

async function runMcpInit(options: z.infer<typeof mcpInitOptionsSchema>) {
  const clientInfo = CLIENTS.find((client) => client.name === options.client);
  if (!clientInfo || clientInfo.shape === "toml") {
    throw new Error(`Cannot write MCP configuration for ${options.client}.`);
  }

  const command = {
    command: "npx",
    args: [`termcn@${TERMCN_MCP_VERSION}`, "mcp"],
  };
  const clientConfig: Record<string, unknown> =
    clientInfo.shape === "mcpServers"
      ? { mcpServers: { termcn: command } }
      : clientInfo.shape === "servers"
        ? { servers: { termcn: command } }
        : {
            $schema: "https://opencode.ai/config.json",
            mcp: {
              termcn: {
                type: "local",
                command: ["npx", ...command.args],
                enabled: true,
              },
            },
          };
  const configPath = path.join(options.cwd, clientInfo.configPath);
  await fsExtra.ensureDir(path.dirname(configPath));

  let existingConfig: Record<string, unknown> = {};
  try {
    existingConfig = JSON.parse(await fs.readFile(configPath, "utf8"));
  } catch {
    // A missing file starts from an empty config.
  }

  const mergedConfig = deepmerge(existingConfig, clientConfig, {
    arrayMerge: overwriteMerge,
  });
  await fs.writeFile(
    configPath,
    `${JSON.stringify(mergedConfig, null, 2)}\n`,
    "utf8"
  );

  return clientInfo.configPath;
}
