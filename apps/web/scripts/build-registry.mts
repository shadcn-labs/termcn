import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

const webRoot = path.resolve(import.meta.dirname, "..");
const repoRoot = path.resolve(webRoot, "../..");
const cliRoot = path.join(repoRoot, "packages", "termcn");
const outputDir = path.join(webRoot, "public", "r");

const cliBuild = spawnSync("pnpm", ["build"], {
  cwd: cliRoot,
  stdio: "inherit",
});
if (cliBuild.error) {
  throw cliBuild.error;
}
if (cliBuild.status !== 0) {
  throw new Error(
    `termcn package build failed with exit code ${cliBuild.status}`
  );
}

await fs.rm(outputDir, { force: true, recursive: true });
await fs.mkdir(outputDir, { recursive: true });

const registryBuild = spawnSync(
  process.execPath,
  [
    path.join(cliRoot, "dist", "index.js"),
    "build",
    "registry.json",
    "--output",
    outputDir,
    "--cwd",
    webRoot,
  ],
  {
    cwd: webRoot,
    stdio: "inherit",
  }
);
if (registryBuild.error) {
  throw registryBuild.error;
}
if (registryBuild.status !== 0) {
  throw new Error(
    `termcn registry build failed with exit code ${registryBuild.status}`
  );
}
