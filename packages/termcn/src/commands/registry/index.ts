import { Command } from "commander";

import { validate } from "@/src/commands/registry/validate";

export const registry = new Command()
  .name("registry")
  .description("manage registries")
  .addCommand(validate);
