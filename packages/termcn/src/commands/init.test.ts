import { describe, expect, it } from "vitest";

import { init, initOptionsSchema } from "./init";

describe("init", () => {
  it("exposes terminal-specific options", () => {
    const help = init.helpInformation();

    expect(help).toContain("--framework <framework>");
    expect(help).toContain("--theme <theme>");
    expect(help).toContain("--template <template>");
    expect(help).not.toContain("--base");
    expect(help).not.toContain("--preset");
  });

  it("accepts only supported terminal frameworks", () => {
    const options = {
      components: [],
      cwd: "/tmp/termcn",
      defaults: false,
      force: false,
      framework: "opentui" as const,
      silent: false,
      tsx: true,
      yes: true,
    };

    expect(initOptionsSchema.parse(options).framework).toBe("opentui");
    expect(() =>
      initOptionsSchema.parse({ ...options, framework: "next" })
    ).toThrow();
  });
});
