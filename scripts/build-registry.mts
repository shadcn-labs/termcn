import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

const root = process.cwd();

const syncTargets = [
  {
    from: path.join(root, "registry", "bases", "ink", "ui"),
    to: "ui",
  },
  {
    from: path.join(root, "registry", "bases", "ink", "hooks"),
    to: "hooks",
  },
  {
    from: path.join(root, "registry", "themes"),
    to: "themes",
  },
  {
    from: path.join(root, "registry", "bases", "opentui", "ui"),
    to: path.join("opentui", "ui"),
  },
] as const;

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

const copyDirContents = async (from: string, to: string) => {
  await ensureDir(to);

  const entries = await fs.readdir(from, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map((entry) =>
        fs.copyFile(path.join(from, entry.name), path.join(to, entry.name))
      )
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
    ["build", "registry.json", "--output", path.join(root, "public", "r")],
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
    syncTargets.map(({ from, to }) =>
      copyDirContents(from, path.join(tempRegistryRoot, to))
    )
  );

  runShadcnBuild(tempRoot);
} finally {
  await fs.rm(tempRoot, { force: true, recursive: true });
}
