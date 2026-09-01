import { describe, expect, it } from "vitest";

import { docs, resolveDocsFramework } from "./docs";

describe("resolveDocsFramework", () => {
  it("accepts OpenTUI explicitly", () => {
    expect(resolveDocsFramework("opentui", undefined)).toBe("opentui");
    expect(docs.helpInformation()).toContain("ink or opentui");
  });

  it("uses the project framework", () => {
    expect(resolveDocsFramework(undefined, "ink")).toBe("ink");
  });

  it("rejects unsupported frameworks", () => {
    expect(() => resolveDocsFramework("unsupported", undefined)).toThrow(
      "Expected one of: ink, opentui"
    );
  });
});
