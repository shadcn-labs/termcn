import deepmerge from "deepmerge";

import { BUILTIN_REGISTRIES, FALLBACK_STYLE } from "@/src/registry/constants";
import { configSchema } from "@/src/schema";
import { Config, createConfig, DeepPartial } from "@/src/utils/get-config";

function resolveStyleFromConfig(config: DeepPartial<Config>) {
  return config.style || FALLBACK_STYLE;
}

export function configWithDefaults(config?: DeepPartial<Config>) {
  const baseConfig = createConfig({
    style: FALLBACK_STYLE,
    registries: BUILTIN_REGISTRIES,
  });

  if (!config) {
    return baseConfig;
  }

  return configSchema.parse(
    deepmerge(baseConfig, {
      ...config,
      style: resolveStyleFromConfig(config),
      registries: { ...BUILTIN_REGISTRIES, ...config.registries },
    })
  );
}
