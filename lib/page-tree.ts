import type { Node as PageTreeNode } from "fumadocs-core/page-tree";

import { DEFAULT_BASE_NAME } from "@/registry/bases";

export type PageTreeFolder = Extract<PageTreeNode, { type: "folder" }>;
export type PageTreePage = Extract<PageTreeNode, { type: "page" }>;

export const getAllPagesFromFolder = (
  folder: PageTreeFolder
): PageTreePage[] => {
  const pages: PageTreePage[] = [];

  for (const child of folder.children) {
    if (child.type === "page") {
      pages.push(child);
    } else if (child.type === "folder") {
      pages.push(...getAllPagesFromFolder(child));
    }
  }

  return pages;
};

const matchesBase = (folder: PageTreeFolder, base: string): boolean =>
  folder.$id === base ||
  (typeof folder.name === "string" && folder.name.toLowerCase() === base);

const findBaseFolder = (
  folder: PageTreeFolder,
  base: string
): PageTreeFolder | undefined => {
  for (const child of folder.children) {
    if (child.type !== "folder") {
      continue;
    }
    if (matchesBase(child, base)) {
      return child;
    }
  }
};

export const getCategoryFolders = (
  folder: PageTreeFolder,
  base: string
): PageTreeFolder[] => {
  const baseFolder = findBaseFolder(folder, base);
  if (!baseFolder) {
    return [];
  }

  return baseFolder.children.filter(
    (c): c is PageTreeFolder => c.type === "folder"
  );
};

export const getFolderPages = (
  folder: PageTreeFolder,
  base?: string
): PageTreePage[] => {
  if (base) {
    const baseFolder = findBaseFolder(folder, base);
    if (!baseFolder) {
      return [];
    }

    return getAllPagesFromFolder(baseFolder);
  }

  return getAllPagesFromFolder(folder);
};

export const getCurrentBase = (pathname: string): string => {
  const match = pathname.match(/\/docs\/components\/([^/]+)\//);
  return match ? match[1] : DEFAULT_BASE_NAME;
};
