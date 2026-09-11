import { describe, expect, it } from "vitest";

import {
  BUILTIN_REGISTRIES,
  DEFAULT_FRAMEWORK,
} from "@/src/registry/constants";
import { createConfig } from "@/src/utils/get-config";

import { configWithDefaults } from "./config";

describe("configWithDefaults", () => {
  it("uses the default framework and built-in registry", () => {
    const result = configWithDefaults();

    expect(result.framework).toBe(DEFAULT_FRAMEWORK);
    expect(result.registries).toEqual(BUILTIN_REGISTRIES);
  });

  it("preserves a selected framework", () => {
    const result = configWithDefaults(createConfig({ framework: "opentui" }));

    expect(result.framework).toBe("opentui");
  });

  it("merges all supported aliases", () => {
    const result = configWithDefaults(
      createConfig({
        aliases: {
          components: "@app/components",
          ui: "@app/ui",
          lib: "@app/lib",
          hooks: "@app/hooks",
          providers: "@app/providers",
          themes: "@app/themes",
        },
      })
    );

    expect(result.aliases).toEqual({
      components: "@app/components",
      ui: "@app/ui",
      lib: "@app/lib",
      hooks: "@app/hooks",
      providers: "@app/providers",
      themes: "@app/themes",
    });
  });

  it("lets explicit project registries override built-ins", () => {
    const result = configWithDefaults(
      createConfig({
        registries: {
          "@termcn": "https://mirror.example/{framework}/{name}.json",
          "@acme": "https://acme.example/{name}.json",
        },
      })
    );

    expect(result.registries?.["@termcn"]).toBe(
      "https://mirror.example/{framework}/{name}.json"
    );
    expect(result.registries?.["@acme"]).toBe(
      "https://acme.example/{name}.json"
    );
  });

  it("rejects removed config fields", () => {
    expect(() => configWithDefaults({ style: "ink" } as never)).toThrow();
    expect(() => configWithDefaults({ tsx: true } as never)).toThrow();
  });
});
