import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "public", "r");

const syncTargets = [
  {
    from: path.join(root, "registry", "bases", "ink", "lib"),
    to: "lib",
  },
  {
    from: path.join(root, "registry", "bases", "ink", "ui"),
    providerImport: "ink-theme-provider",
    to: "ui",
  },
  {
    from: path.join(root, "registry", "bases", "ink", "hooks"),
    to: "hooks",
  },
  {
    from: path.join(root, "registry", "bases", "ink", "themes"),
    providerImport: "ink-theme-provider",
    to: "themes",
  },
  {
    from: path.join(root, "registry", "bases", "opentui", "lib"),
    to: path.join("opentui", "lib"),
  },
  {
    from: path.join(root, "registry", "bases", "opentui", "themes"),
    providerImport: "opentui-theme-provider",
    to: path.join("opentui", "themes"),
  },
  {
    from: path.join(root, "registry", "bases", "opentui", "ui"),
    providerImport: "opentui-theme-provider",
    to: path.join("opentui", "ui"),
  },
] as const;

const transformPublishedImports = (
  content: string,
  providerImport: "ink-theme-provider" | "opentui-theme-provider"
) =>
  content
    .replaceAll("@/registry/bases/ink/lib/", "@/lib/")
    .replaceAll("@/registry/bases/opentui/lib/", "@/lib/")
    .replaceAll("@/registry/bases/ink/ui/types", "@/components/ui/types")
    .replaceAll("@/registry/bases/opentui/ui/types", "@/components/ui/types")
    .replaceAll("@/registry/bases/ink/themes/", "@/lib/terminal-themes/")
    .replaceAll("@/registry/bases/opentui/themes/", "@/lib/terminal-themes/")
    .replaceAll(
      `@/components/ui/${providerImport}`,
      "@/components/ui/theme-provider"
    );

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

const copyDirContents = async (
  from: string,
  to: string,
  providerImport?: "ink-theme-provider" | "opentui-theme-provider"
) => {
  await ensureDir(to);

  const entries = await fs.readdir(from, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => {
        const sourcePath = path.join(from, entry.name);
        const targetPath = path.join(to, entry.name);

        if (!providerImport) {
          await fs.copyFile(sourcePath, targetPath);
          return;
        }

        const content = await fs.readFile(sourcePath, "utf-8");
        await fs.writeFile(
          targetPath,
          transformPublishedImports(content, providerImport)
        );
      })
  );
};

const runShadcnBuild = (cwd: string) => {
  const shadcnBin = path.join(
    root,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "shadcn.cmd" : "shadcn"
  );

  const result = spawnSync(
    shadcnBin,
    ["build", "registry.json", "--output", outputDir],
    {
      cwd,
      stdio: "inherit",
    }
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `shadcn build failed with exit code ${result.status ?? -1}`
    );
  }
};

const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "termcn-registry-"));

try {
  const tempRegistryRoot = path.join(tempRoot, "registry");

  await fs.copyFile(
    path.join(root, "registry.json"),
    path.join(tempRoot, "registry.json")
  );

  await Promise.all(
    syncTargets.map((target) =>
      copyDirContents(
        target.from,
        path.join(tempRegistryRoot, target.to),
        "providerImport" in target ? target.providerImport : undefined
      )
    )
  );

  await fs.rm(outputDir, { force: true, recursive: true });
  await Promise.all([
    ensureDir(path.join(outputDir, "ink")),
    ensureDir(path.join(outputDir, "opentui")),
  ]);
  runShadcnBuild(tempRoot);
} finally {
  await fs.rm(tempRoot, { force: true, recursive: true });
}
