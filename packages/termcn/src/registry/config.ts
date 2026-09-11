import {
  BUILTIN_REGISTRIES,
  DEFAULT_FRAMEWORK,
} from "@/src/registry/constants";
import { configSchema } from "@/src/schema";
import { Config, createConfig, DeepPartial } from "@/src/utils/get-config";

export function configWithDefaults(config?: DeepPartial<Config>) {
  const merged = createConfig({
    ...config,
    framework: config?.framework ?? DEFAULT_FRAMEWORK,
    aliases: {
      components: "",
      ...config?.aliases,
    },
    registries: {
      ...BUILTIN_REGISTRIES,
      ...config?.registries,
    },
    resolvedPaths: {
      cwd: process.cwd(),
      components: "",
      ui: "",
      lib: "",
      hooks: "",
      providers: "",
      themes: "",
      ...config?.resolvedPaths,
    },
  });

  return configSchema.parse(merged);
}
