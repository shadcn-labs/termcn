import { beforeEach, describe, expect, it, vi } from "vitest";

import { addRegistryItems } from "./add";

const {
  mockAddComponents,
  mockClearRegistryContext,
  mockCreateConfig,
  mockEnsureRegistriesInConfig,
  mockGetConfig,
  mockResolveRegistryTree,
  mockWithRegistryContext,
} = vi.hoisted(() => ({
  mockAddComponents: vi.fn(),
  mockClearRegistryContext: vi.fn(),
  mockCreateConfig: vi.fn(),
  mockEnsureRegistriesInConfig: vi.fn(),
  mockGetConfig: vi.fn(),
  mockResolveRegistryTree: vi.fn(),
  mockWithRegistryContext: vi.fn(),
}));

vi.mock("@/src/registry/resolver", () => ({
  resolveRegistryTree: mockResolveRegistryTree,
}));
vi.mock("@/src/registry/context", () => ({
  clearRegistryContext: mockClearRegistryContext,
  withRegistryContext: mockWithRegistryContext,
}));
vi.mock("@/src/utils/add-components", () => ({
  addComponents: mockAddComponents,
}));
vi.mock("@/src/utils/get-config", () => ({
  createConfig: mockCreateConfig,
  getConfig: mockGetConfig,
}));
vi.mock("@/src/utils/registries", () => ({
  ensureRegistriesInConfig: mockEnsureRegistriesInConfig,
}));

describe("addRegistryItems", () => {
  const projectConfig = { resolvedPaths: { cwd: "/project" } };
  const configured = { ...projectConfig, registries: { "@acme": "url" } };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWithRegistryContext.mockImplementation((callback) => callback());
    mockGetConfig.mockResolvedValue(projectConfig);
    mockEnsureRegistriesInConfig.mockResolvedValue({
      config: configured,
      newRegistries: [],
    });
    mockResolveRegistryTree.mockResolvedValue({ files: [] });
  });

  it("loads config, validates namespaces, and installs non-interactively", async () => {
    await addRegistryItems(["@acme/button"], {
      cwd: "/project",
      overwrite: true,
      silent: true,
    });

    expect(mockGetConfig).toHaveBeenCalledWith("/project");
    expect(mockEnsureRegistriesInConfig).toHaveBeenCalledWith(
      ["@acme/button"],
      projectConfig
    );
    expect(mockAddComponents).toHaveBeenCalledWith(
      ["@acme/button"],
      configured,
      expect.objectContaining({
        interactive: false,
        overwrite: true,
        silent: true,
      })
    );
    expect(mockClearRegistryContext).toHaveBeenCalledOnce();
  });

  it("defaults cwd to process.cwd()", async () => {
    const cwdSpy = vi.spyOn(process, "cwd").mockReturnValue("/default/project");
    try {
      await addRegistryItems(["@acme/button"]);
    } finally {
      cwdSpy.mockRestore();
    }

    expect(mockGetConfig).toHaveBeenCalledWith("/default/project");
  });

  it("installs a universal item with a project-root target without termcn.json", async () => {
    const universalConfig = { resolvedPaths: { cwd: "/project" } };
    const resolvedTree = {
      files: [
        {
          path: "agent.ts",
          target: "~/agent/extensions/agent.ts",
          type: "registry:file",
        },
      ],
    };
    mockGetConfig.mockResolvedValue(null);
    mockCreateConfig.mockReturnValue(universalConfig);
    mockEnsureRegistriesInConfig.mockResolvedValue({
      config: universalConfig,
      newRegistries: [],
    });
    mockResolveRegistryTree.mockResolvedValue(resolvedTree);

    await addRegistryItems(["https://example.com/agent.json"], {
      cwd: "/project",
    });

    expect(mockCreateConfig).toHaveBeenCalledWith({
      framework: "ink",
      resolvedPaths: { cwd: "/project" },
    });
    expect(mockAddComponents).toHaveBeenCalledWith(
      ["https://example.com/agent.json"],
      universalConfig,
      expect.objectContaining({ resolvedTree })
    );
  });

  it("rejects unresolved target aliases without termcn.json", async () => {
    const universalConfig = { resolvedPaths: { cwd: "/project", ui: "" } };
    mockGetConfig.mockResolvedValue(null);
    mockCreateConfig.mockReturnValue(universalConfig);
    mockEnsureRegistriesInConfig.mockResolvedValue({
      config: universalConfig,
      newRegistries: [],
    });
    mockResolveRegistryTree.mockResolvedValue({
      files: [
        { path: "agent.ts", target: "@ui/agent.ts", type: "registry:file" },
      ],
    });

    await expect(
      addRegistryItems(["https://example.com/agent.json"], { cwd: "/project" })
    ).rejects.toThrow(
      "A termcn.json file is required to resolve target aliases."
    );
    expect(mockAddComponents).not.toHaveBeenCalled();
  });

  it("always clears registry context when installation fails", async () => {
    mockAddComponents.mockRejectedValueOnce(new Error("Installation failed."));

    await expect(
      addRegistryItems(["@acme/button"], { cwd: "/project" })
    ).rejects.toThrow("Installation failed.");
    expect(mockClearRegistryContext).toHaveBeenCalledOnce();
  });
});
