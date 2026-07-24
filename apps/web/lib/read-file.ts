import { promises as fs } from "node:fs";
import path from "node:path";

export const readFileFromRoot = (relativePath: string) => {
  const absolutePath = path.join(process.cwd(), relativePath);
  return fs.readFile(absolutePath, "utf-8");
};
