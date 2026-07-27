import type {
  Node as PageTreeNode,
  Root as PageTreeRoot,
} from "fumadocs-core/page-tree";

import { ROUTES } from "@/constants/routes";
import {
  EXCLUDED_SECTIONS,
  isChartsFolder,
  isComponentsFolder,
  isDitherChartUrl,
  isTemplatesFolder,
  isThemesFolder,
} from "@/lib/docs";
import { DEFAULT_BASE_NAME } from "@/registry/bases";

export type PageTreeFolder = Extract<PageTreeNode, { type: "folder" }>;
export type PageTreePage = Extract<PageTreeNode, { type: "page" }>;

export interface TreeGroup {
  label: string;
  pages: PageTreePage[];
}

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
  const baseScopedMatch = pathname.match(
    /\/docs\/(?:components|templates|charts)\/([^/]+)(?:\/|$)/
  );
  if (baseScopedMatch) {
    return baseScopedMatch[1];
  }

  const themesMatch = pathname.match(/\/docs\/themes\/([^/]+)\//);
  if (
    themesMatch &&
    (themesMatch[1] === "ink" || themesMatch[1] === "opentui")
  ) {
    return themesMatch[1];
  }

  return DEFAULT_BASE_NAME;
};

export const getTreeGroups = (
  tree: PageTreeRoot,
  currentBase: string
): TreeGroup[] => {
  const groups: TreeGroup[] = [];

  for (const item of tree.children) {
    if (item.type !== "folder") {
      continue;
    }
    if (EXCLUDED_SECTIONS.has(item.$id ?? "")) {
      continue;
    }

    if (isComponentsFolder(item)) {
      for (const category of getCategoryFolders(item, currentBase)) {
        const pages = getFolderPages(category);
        if (pages.length > 0) {
          groups.push({
            label:
              typeof category.name === "string"
                ? category.name
                : String(category.name),
            pages,
          });
        }
      }
    } else if (isChartsFolder(item)) {
      const chartPages = getFolderPages(item, currentBase).filter(
        (page) => page.url !== `${ROUTES.DOCS_CHARTS}/${currentBase}`
      );
      const pageGroups = [
        {
          label: "Basic Charts",
          pages: chartPages.filter((page) => !isDitherChartUrl(page.url)),
        },
        {
          label: "Dither Charts",
          pages: chartPages.filter((page) => isDitherChartUrl(page.url)),
        },
      ];

      for (const group of pageGroups) {
        if (group.pages.length > 0) {
          groups.push({ label: group.label, pages: group.pages });
        }
      }
    } else if (isTemplatesFolder(item) || isThemesFolder(item)) {
      const pages = getFolderPages(item, currentBase);
      if (pages.length > 0) {
        groups.push({
          label: typeof item.name === "string" ? item.name : String(item.name),
          pages,
        });
      }
    } else {
      const pages = getFolderPages(item);
      if (pages.length > 0) {
        groups.push({
          label: typeof item.name === "string" ? item.name : String(item.name),
          pages,
        });
      }
    }
  }

  return groups;
};
