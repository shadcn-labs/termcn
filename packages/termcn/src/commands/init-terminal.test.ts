import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { addComponents } from "@/src/utils/add-components";
import { getConfig, type Config } from "@/src/utils/get-config";

import { runInit } from "./init";

vi.mock("@/src/utils/add-components", () => ({
  addComponents: vi.fn(),
}));

vi.mock("@/src/utils/get-config", () => ({
  getConfig: vi.fn(),
}));

vi.mock("@/src/utils/logger", () => ({
  logger: {
    break: vi.fn(),
    log: vi.fn(),
  },
}));

describe("terminal init configuration", () => {
  let cwd: string;

  beforeEach(async () => {
    cwd = await mkdtemp(path.join(os.tmpdir(), "termcn-terminal-init-"));
    await writeFile(
      path.join(cwd, "package.json"),
      JSON.stringify({ private: true }),
      "utf8"
    );
    vi.mocked(getConfig).mockResolvedValue({} as Config);
    vi.mocked(addComponents).mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await rm(cwd, { force: true, recursive: true });
    vi.clearAllMocks();
  });

  it("persists font and icon choices and writes the Ink helpers", async () => {
    await runInit({
      cwd,
      font: "hack",
      force: true,
      framework: "ink",
      icons: "octicons",
      silent: true,
      template: "blank",
      theme: "dracula",
      yes: true,
    });

    const config = JSON.parse(
      await readFile(path.join(cwd, "components.json"), "utf8")
    );
    const nerdFont = await readFile(
      path.join(cwd, "src/lib/nerd-font.ts"),
      "utf8"
    );
    const nerdIcon = await readFile(
      path.join(cwd, "src/components/ui/nerd-icon.tsx"),
      "utf8"
    );

    expect(config).toMatchObject({
      font: "hack",
      icons: "octicons",
      style: "ink",
    });
    expect(nerdFont).toContain('"Hack Nerd Font Mono"');
    expect(nerdFont).toContain('export const NERD_ICON_SET = "octicons"');
    expect(nerdIcon).toContain('from "ink"');
    expect(nerdIcon).toContain("name: NerdIconName");
  });

  it("writes an OpenTUI-native icon component", async () => {
    await runInit({
      cwd,
      font: "meslo",
      force: true,
      framework: "opentui",
      icons: "material",
      silent: true,
      template: "blank",
      theme: "nord",
      yes: true,
    });

    const nerdIcon = await readFile(
      path.join(cwd, "src/components/ui/nerd-icon.tsx"),
      "utf8"
    );

    expect(nerdIcon).toContain("/** @jsxImportSource @opentui/react */");
    expect(nerdIcon).toContain("<text fg={fg}>");
  });
});
