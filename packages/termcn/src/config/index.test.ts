import { describe, expect, it } from "vitest";

import {
  buildInitCommand,
  getThemeExportName,
  projectConfigSchema,
} from "./index";

describe("termcn project config", () => {
  it("uses the terminal defaults", () => {
    expect(projectConfigSchema.parse({})).toEqual({
      font: "jetbrains-mono",
      framework: "ink",
      icons: "codicons",
      template: "blank",
      theme: "default",
    });
  });

  it("builds package-manager-specific init commands", () => {
    expect(
      buildInitCommand({
        font: "hack",
        framework: "opentui",
        icons: "octicons",
        name: "terminal-dashboard",
        packageManager: "bun",
        template: "usage-monitor",
        theme: "dracula",
      })
    ).toBe(
      "bunx --bun termcn@latest init --framework opentui --theme dracula --font hack --icons octicons --template usage-monitor --name terminal-dashboard --yes"
    );
  });

  it("maps theme slugs to their generated exports", () => {
    expect(getThemeExportName("high-contrast-light")).toBe(
      "highContrastLightTheme"
    );
  });
});
