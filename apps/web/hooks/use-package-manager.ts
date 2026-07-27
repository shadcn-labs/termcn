import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

const packageManagerAtom = atomWithStorage<PackageManager>(
  "package-manager",
  "pnpm"
);

export const usePackageManager = () => useAtom(packageManagerAtom);
