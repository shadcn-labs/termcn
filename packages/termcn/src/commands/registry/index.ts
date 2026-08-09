import { Command } from "commander";

import { add } from "@/src/commands/registry/add";
import { validate } from "@/src/commands/registry/validate";

export const registry = new Command()
  .name("registry")
  .description("manage registries")
  .addCommand(add)
  .addCommand(validate);
