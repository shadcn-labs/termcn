import path from "path";

import { loadConfig, type ConfigLoaderSuccessResult } from "tsconfig-paths";
import { describe, expect, it } from "vitest";

import { getFixturesDir } from "@/src/test-helpers";

import { resolveImport } from "./resolve-import";

describe("resolveImport", () => {
  it("resolve import", async () => {
    expect(
      await resolveImport("@/foo/bar", {
        absoluteBaseUrl: "/Users/termcn/Projects/foobar",
        paths: {
          "@/*": ["./src/*"],
          "~/components/*": ["./src/components/*"],
          "~/lib": ["./src/lib"],
        },
      })
    ).toEqual("/Users/termcn/Projects/foobar/src/foo/bar");

    expect(
      await resolveImport("~/components/foo/bar/baz", {
        absoluteBaseUrl: "/Users/termcn/Projects/foobar",
        paths: {
          "@/*": ["./src/*"],
          "~/components/*": ["./src/components/*"],
          "~/lib": ["./src/lib"],
        },
      })
    ).toEqual("/Users/termcn/Projects/foobar/src/components/foo/bar/baz");

    expect(
      await resolveImport("components/foo/bar", {
        absoluteBaseUrl: "/Users/termcn/Projects/foobar",
        paths: {
          "components/*": ["./src/app/components/*"],
          "ui/*": ["./src/ui/primities/*"],
          lib: ["./lib"],
        },
      })
    ).toEqual("/Users/termcn/Projects/foobar/src/app/components/foo/bar");

    expect(
      await resolveImport("lib/utils", {
        absoluteBaseUrl: "/Users/termcn/Projects/foobar",
        paths: {
          "components/*": ["./src/app/components/*"],
          "ui/*": ["./src/ui/primities/*"],
          lib: ["./lib"],
        },
      })
    ).toEqual("/Users/termcn/Projects/foobar/lib/utils");
  });

  it("resolve import with base url", async () => {
    const cwd = getFixturesDir("with-base-url");
    const config = (await loadConfig(cwd)) as ConfigLoaderSuccessResult;

    expect(await resolveImport("@/components/ui", config)).toEqual(
      path.resolve(cwd, "components/ui")
    );
    expect(await resolveImport("@/lib/utils", config)).toEqual(
      path.resolve(cwd, "lib/utils")
    );
    expect(await resolveImport("foo/bar", config)).toEqual(
      path.resolve(cwd, "foo/bar")
    );
  });

  it("resolve import without base url", async () => {
    const cwd = getFixturesDir("without-base-url");
    const config = (await loadConfig(cwd)) as ConfigLoaderSuccessResult;

    expect(await resolveImport("~/components/ui", config)).toEqual(
      path.resolve(cwd, "components/ui")
    );
    expect(await resolveImport("~/lib/utils", config)).toEqual(
      path.resolve(cwd, "lib/utils")
    );
    expect(await resolveImport("foo/bar", config)).toEqual(
      path.resolve(cwd, "foo/bar")
    );
  });
});
