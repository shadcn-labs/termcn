import { beforeEach, describe, expect, it, vi } from "vitest";

import { resolveRegistryNamespaces } from "@/src/registry/namespaces";
import { createConfig } from "@/src/utils/get-config";

import { ensureRegistriesInConfig } from "./registries";

vi.mock("@/src/registry/namespaces", () => ({
  resolveRegistryNamespaces: vi.fn(),
}));

describe("ensureRegistriesInConfig", () => {
  beforeEach(() => {
    vi.mocked(resolveRegistryNamespaces).mockReset();
  });

  it("accepts built-in namespaces", async () => {
    vi.mocked(resolveRegistryNamespaces).mockResolvedValue(["@termcn"]);
    const config = createConfig({ framework: "ink" });

    await expect(
      ensureRegistriesInConfig(["@termcn/button"], config)
    ).resolves.toEqual({ config, newRegistries: [] });
  });

  it("accepts namespaces explicitly configured in termcn.json", async () => {
    vi.mocked(resolveRegistryNamespaces).mockResolvedValue(["@acme"]);
    const config = createConfig({
      registries: { "@acme": "https://acme.example/{name}.json" },
    });

    await expect(
      ensureRegistriesInConfig(["@acme/button"], config)
    ).resolves.toEqual({ config, newRegistries: [] });
  });

  it("rejects unknown namespaces without mutating config", async () => {
    vi.mocked(resolveRegistryNamespaces).mockResolvedValue(["@missing"]);
    const config = createConfig({ framework: "opentui" });

    await expect(
      ensureRegistriesInConfig(["@missing/button"], config)
    ).rejects.toThrow('Unknown registry "@missing"');
    expect(config.registries?.["@missing"]).toBeUndefined();
  });
});
