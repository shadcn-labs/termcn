import { BUILTIN_REGISTRIES } from "@/src/registry/constants";
import { RegistryNotConfiguredError } from "@/src/registry/errors";
import { resolveRegistryNamespaces } from "@/src/registry/namespaces";
import { Config } from "@/src/utils/get-config";

/**
 * Verifies that every namespace referenced by the requested items is present
 * in termcn.json. termcn deliberately has no hosted registry marketplace:
 * third-party registry URLs remain explicit project configuration.
 */
export async function ensureRegistriesInConfig(
  components: string[],
  config: Config
) {
  const registryNames = await resolveRegistryNamespaces(components, config);
  const missingRegistry = registryNames.find(
    (registry) =>
      !config.registries?.[registry] && !(registry in BUILTIN_REGISTRIES)
  );

  if (missingRegistry) {
    throw new RegistryNotConfiguredError(missingRegistry);
  }

  return { config, newRegistries: [] as string[] };
}
