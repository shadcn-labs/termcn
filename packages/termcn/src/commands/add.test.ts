import { describe, expect, it } from "vitest";

import { add, addOptionsSchema } from "./add";

describe("add", () => {
  it("keeps diff and view as add modes instead of standalone commands", () => {
    const help = add.helpInformation();

    expect(help).toContain("--dry-run");
    expect(help).toContain("--diff [path]");
    expect(help).toContain("--view [path]");
  });

  it("parses terminal component requests", () => {
    const options = addOptionsSchema.parse({
      all: false,
      components: ["toast"],
      cwd: "/tmp/termcn",
      dryRun: false,
      overwrite: false,
      silent: false,
      yes: true,
    });

    expect(options.components).toEqual(["toast"]);
  });
});
