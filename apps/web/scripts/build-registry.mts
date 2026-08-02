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
    from: path.join(root, "registry", "bases", "ink", "providers"),
    to: "providers",
  },
  {
    from: path.join(root, "registry", "bases", "ink", "ui"),
    to: "ui",
  },
  {
    from: path.join(root, "registry", "bases", "ink", "hooks"),
    to: "hooks",
  },
  {
    from: path.join(root, "registry", "bases", "ink", "themes"),
    to: "themes",
  },
  {
    from: path.join(root, "registry", "bases", "opentui", "lib"),
    to: path.join("opentui", "lib"),
  },
  {
    from: path.join(root, "registry", "bases", "opentui", "providers"),
    to: path.join("opentui", "providers"),
  },
  {
    from: path.join(root, "registry", "bases", "opentui", "hooks"),
    to: path.join("opentui", "hooks"),
  },
  {
    from: path.join(root, "registry", "bases", "opentui", "themes"),
    to: path.join("opentui", "themes"),
  },
  {
    from: path.join(root, "registry", "bases", "opentui", "ui"),
    to: path.join("opentui", "ui"),
  },
] as const;

const transformPublishedImports = (content: string) =>
  content
    .replaceAll("@/registry/bases/ink/lib/", "@/lib/")
    .replaceAll("@/registry/bases/opentui/lib/", "@/lib/")
    .replaceAll("@/registry/bases/ink/ui/types", "@/components/ui/types")
    .replaceAll("@/registry/bases/opentui/ui/types", "@/components/ui/types")
    .replaceAll("@/registry/bases/ink/themes/", "@/lib/terminal-themes/")
    .replaceAll("@/registry/bases/opentui/themes/", "@/lib/terminal-themes/")
    .replaceAll("@/registry/bases/ink/hooks/", "@/hooks/")
    .replaceAll("@/registry/bases/opentui/hooks/", "@/hooks/")
    .replaceAll("@/registry/bases/ink/providers/", "@/providers/")
    .replaceAll("@/registry/bases/opentui/providers/", "@/providers/");

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

const copyDirContents = async (from: string, to: string) => {
  await ensureDir(to);

  const entries = await fs.readdir(from, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => {
        const sourcePath = path.join(from, entry.name);
        const targetPath = path.join(to, entry.name);

        const content = await fs.readFile(sourcePath, "utf-8");
        await fs.writeFile(targetPath, transformPublishedImports(content));
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

interface RegistryFile {
  path: string;
  target?: string;
}

interface RegistryItem {
  files?: RegistryFile[];
  name: string;
}

const restorePublishedTargets = async () => {
  const sourceRegistry = JSON.parse(
    await fs.readFile(path.join(root, "registry.json"), "utf-8")
  ) as { items: RegistryItem[] };

  for (const sourceItem of sourceRegistry.items) {
    if (!sourceItem.name.startsWith("ink/")) {
      continue;
    }

    const targets = new Map(
      (sourceItem.files ?? [])
        .filter((file) => file.target)
        .map((file) => [file.path, file.target as string])
    );
    if (targets.size === 0) {
      continue;
    }

    const itemPath = path.join(outputDir, `${sourceItem.name}.json`);
    const publishedItem = JSON.parse(
      await fs.readFile(itemPath, "utf-8")
    ) as RegistryItem;
    for (const file of publishedItem.files ?? []) {
      file.target = targets.get(file.path);
    }
    await fs.writeFile(itemPath, `${JSON.stringify(publishedItem, null, 2)}\n`);
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
      copyDirContents(target.from, path.join(tempRegistryRoot, target.to))
    )
  );

  await fs.rm(outputDir, { force: true, recursive: true });
  await Promise.all([
    ensureDir(path.join(outputDir, "ink")),
    ensureDir(path.join(outputDir, "opentui")),
  ]);
  runShadcnBuild(tempRoot);
  await restorePublishedTargets();
} finally {
  await fs.rm(tempRoot, { force: true, recursive: true });
}
