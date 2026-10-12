#!/usr/bin/env node
import { pathToFileURL } from "node:url";

import { Command } from "commander";

import { add } from "@/src/commands/add";
import { build } from "@/src/commands/build";
import { init } from "@/src/commands/init";
import { mcp } from "@/src/commands/mcp";
import { registry } from "@/src/commands/registry";
import { search } from "@/src/commands/search";
import { view } from "@/src/commands/view";

import packageJson from "../package.json";

function main() {
  process.on("SIGINT", () => process.exit(0));
  process.on("SIGTERM", () => process.exit(0));

  const program = new Command()
    .name("termcn")
    .description("build terminal interfaces with Ink and OpenTUI")
    .version(
      packageJson.version || "1.0.0",
      "-v, --version",
      "display the version number"
    );

  program
    .addCommand(init)
    .addCommand(add)
    .addCommand(view)
    .addCommand(search)
    .addCommand(build)
    .addCommand(mcp)
    .addCommand(registry);

  program.parse();
}

const entryUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
if (entryUrl === import.meta.url) {
  main();
}
