import { z } from "zod";

import { registryConfigSchema } from "@/src/schema";

export const REGISTRY_URL = process.env.REGISTRY_URL ?? "https://termcn.dev/r";

export const TERMCN_URL = REGISTRY_URL.replace(/\/r\/?$/, "");

export const DEFAULT_FRAMEWORK = "ink";

// Built-in registries that are always available and cannot be overridden
export const BUILTIN_REGISTRIES: z.infer<typeof registryConfigSchema> = {
  "@termcn": `${REGISTRY_URL}/{framework}/{name}.json`,
};
