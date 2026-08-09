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

export interface FolderSection extends TreeGroup {
  id: string;
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

export const findChildFolder = (
  folder: PageTreeFolder,
  name: string
): PageTreeFolder | undefined => {
  for (const child of folder.children) {
    if (child.type !== "folder") {
      continue;
    }
    if (
      child.$id === name ||
      String(child.$id ?? "").endsWith(`/${name}`) ||
      (typeof child.name === "string" &&
        child.name.toLowerCase() === name.toLowerCase())
    ) {
      return child;
    }
  }
};

export const getCategoryFolders = (
  folder: PageTreeFolder,
  base: string
): PageTreeFolder[] => {
  const baseFolder = findChildFolder(folder, base);
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
    const baseFolder = findChildFolder(folder, base);
    if (!baseFolder) {
      return [];
    }

    return getAllPagesFromFolder(baseFolder);
  }

  return getAllPagesFromFolder(folder);
};

export const getFolderSections = (
  folder: PageTreeFolder,
  base: string
): FolderSection[] => {
  if (isComponentsFolder(folder)) {
    return getCategoryFolders(folder, base).flatMap((category) => {
      const pages = getFolderPages(category);
      if (pages.length === 0) {
        return [];
      }

      const fallbackId = String(category.name)
        .trim()
        .toLowerCase()
        .replaceAll(" ", "-");

      return [
        {
          id:
            String(category.$id ?? "")
              .split("/")
              .at(-1) ?? fallbackId,
          label: String(category.name),
          pages,
        },
      ];
    });
  }

  if (!isChartsFolder(folder)) {
    return [];
  }

  const pages = getFolderPages(folder, base).filter(
    (page) => page.url !== `${ROUTES.DOCS_CHARTS}/${base}`
  );

  return [
    {
      id: "basic",
      label: "Basic",
      pages: pages.filter((page) => !isDitherChartUrl(page.url)),
    },
    {
      id: "dither",
      label: "Dither",
      pages: pages.filter((page) => isDitherChartUrl(page.url)),
    },
  ].filter((section) => section.pages.length > 0);
};

export const getCurrentBase = (pathname: string): string => {
  const baseScopedMatch = pathname.match(
    /\/docs\/(?:components|templates|charts|theming)\/([^/]+)(?:\/|$)/
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

    const isChartSection = isChartsFolder(item);
    if (isComponentsFolder(item) || isChartSection) {
      for (const section of getFolderSections(item, currentBase)) {
        groups.push({
          label: `${section.label}${isChartSection ? " Charts" : ""}`,
          pages: section.pages,
        });
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
