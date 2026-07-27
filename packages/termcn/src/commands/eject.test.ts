import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";

import { execa } from "execa";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  formatMonorepoMessage,
  getMonorepoTargets,
  isMonorepoRoot,
} from "@/src/utils/get-monorepo-info";
import { getPackageManager } from "@/src/utils/get-package-manager";

import { runEject, TERMCN_TAILWIND_IMPORT } from "./eject";

vi.mock("execa", () => ({
  execa: vi.fn(),
}));

vi.mock("@/src/utils/get-package-manager", () => ({
  getPackageManager: vi.fn().mockResolvedValue("pnpm"),
}));

vi.mock("@/src/utils/get-monorepo-info", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/src/utils/get-monorepo-info")>();
  return {
    ...actual,
    formatMonorepoMessage: vi.fn(),
    getMonorepoTargets: vi.fn().mockResolvedValue([]),
    isMonorepoRoot: vi.fn().mockResolvedValue(false),
  };
});

vi.mock("@/src/utils/spinner", () => ({
  spinner: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn(),
  })),
}));

vi.mock("@/src/utils/logger", () => ({
  logger: {
    break: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
  },
}));

const fixtureConfig = {
  $schema: "https://termcn.dev/schema.json",
  style: "base-nova",
  rsc: true,
  tsx: true,
  tailwind: {
    config: "",
    css: "app/globals.css",
    baseColor: "neutral",
    cssVariables: true,
  },
  aliases: {
    components: "@/components",
    utils: "@/lib/utils",
    ui: "@/components/ui",
    lib: "@/lib",
    hooks: "@/hooks",
  },
};

const fixtureTsconfig = {
  compilerOptions: {
    baseUrl: ".",
    paths: {
      "@/*": ["./*"],
    },
  },
};

const baseCss = `@import "tailwindcss";
@import "tw-animate-css";
@import "termcn/tailwind.css";

@layer base {
  body {
    @apply bg-background text-foreground;
  }
}
`;

describe("runEject", () => {
  let tempDir: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(getPackageManager).mockResolvedValue("pnpm");
    tempDir = await mkdtemp(path.join(os.tmpdir(), "termcn-eject-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  async function setupProject(
    cssContent: string,
    packageJson: Record<string, unknown> = {
      name: "test-app",
      dependencies: {
        termcn: "^4.8.3",
      },
    }
  ) {
    await writeFile(
      path.join(tempDir, "components.json"),
      JSON.stringify(fixtureConfig, null, 2)
    );
    await writeFile(
      path.join(tempDir, "tsconfig.json"),
      JSON.stringify(fixtureTsconfig, null, 2)
    );
    await mkdir(path.join(tempDir, "app"), { recursive: true });
    await writeFile(path.join(tempDir, "app", "globals.css"), cssContent);
    await writeFile(
      path.join(tempDir, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );
  }

  it("inlines termcn/tailwind.css and removes the dependency", async () => {
    await setupProject(baseCss);

    await runEject({
      cwd: tempDir,
      yes: true,
      silent: true,
    });

    const output = await readFile(
      path.join(tempDir, "app", "globals.css"),
      "utf8"
    );
    const termcnCss = await readFile(
      path.join(process.cwd(), "src/tailwind.css"),
      "utf8"
    );

    expect(output).not.toMatch(TERMCN_TAILWIND_IMPORT);
    expect(output).toContain('@import "tailwindcss";');
    expect(output).toContain('@import "tw-animate-css";');
    expect(output).toContain("/* ejected from termcn@4.8.3 */");
    expect(output).toContain(termcnCss.trim());
    expect(output).toContain("@layer base");
    expect(output).toContain("@apply bg-background text-foreground;");
    expect(execa).toHaveBeenCalledWith("pnpm", ["remove", "termcn"], {
      cwd: tempDir,
    });
  });

  it("removes termcn from devDependencies", async () => {
    await setupProject(baseCss, {
      name: "test-app",
      devDependencies: {
        termcn: "^4.8.3",
      },
    });

    await runEject({
      cwd: tempDir,
      yes: true,
      silent: true,
    });

    const output = await readFile(
      path.join(tempDir, "app", "globals.css"),
      "utf8"
    );

    expect(output).toContain("/* ejected from termcn@4.8.3 */");
    expect(execa).toHaveBeenCalledWith("pnpm", ["remove", "termcn"], {
      cwd: tempDir,
    });
  });

  it("skips dependency removal when termcn is not in package.json", async () => {
    await setupProject(baseCss, {
      name: "test-app",
      dependencies: {},
    });

    await runEject({
      cwd: tempDir,
      yes: true,
      silent: true,
    });

    expect(execa).not.toHaveBeenCalled();
  });

  it("removes termcn from package.json for deno", async () => {
    vi.mocked(getPackageManager).mockResolvedValue("deno");
    await setupProject(baseCss);

    await runEject({
      cwd: tempDir,
      yes: true,
      silent: true,
    });

    const packageJson = JSON.parse(
      await readFile(path.join(tempDir, "package.json"), "utf8")
    );

    expect(packageJson.dependencies?.termcn).toBeUndefined();
    expect(execa).not.toHaveBeenCalled();
  });

  it("exits when termcn/tailwind.css is not imported", async () => {
    await setupProject(`@import "tailwindcss";
@import "tw-animate-css";
`);

    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit");
    }) as never);

    await expect(
      runEject({
        cwd: tempDir,
        yes: true,
        silent: true,
      })
    ).rejects.toThrow("process.exit");

    exit.mockRestore();
  });

  it("shows monorepo suggestions when run from a monorepo root", async () => {
    vi.mocked(isMonorepoRoot).mockResolvedValue(true);
    vi.mocked(getMonorepoTargets).mockResolvedValue([
      { name: "packages/ui", hasConfig: true },
      { name: "apps/web", hasConfig: true },
    ]);

    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit");
    }) as never);

    await expect(
      runEject({
        cwd: tempDir,
        yes: true,
        silent: true,
      })
    ).rejects.toThrow("process.exit");

    expect(formatMonorepoMessage).toHaveBeenCalledWith("eject", [
      { name: "packages/ui", hasConfig: true },
      { name: "apps/web", hasConfig: true },
    ]);

    exit.mockRestore();
  });
});
