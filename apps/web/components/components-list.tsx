import Link from "next/link";

import { isComponentsFolder } from "@/lib/docs";
import type { PageTreeFolder, PageTreePage } from "@/lib/page-tree";
import {
  findChildFolder,
  getFolderPages,
  getFolderSections,
} from "@/lib/page-tree";
import { source } from "@/lib/source";
import { cn } from "@/lib/utils";
import { DEFAULT_BASE_NAME } from "@/registry/bases";

const getFolder = (name: string): PageTreeFolder | undefined => {
  for (const node of source.pageTree.children) {
    if (node.type === "folder" && node.name === name) {
      return node;
    }
  }
};

const ComponentGrid = ({
  className,
  pages,
}: {
  className?: string;
  pages: PageTreePage[];
}) => (
  <div
    className={cn(
      "grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-x-8 lg:gap-x-16 lg:gap-y-6 xl:gap-x-20",
      className
    )}
  >
    {pages.map((component) => (
      <Link
        key={component.$id}
        href={component.url}
        className="inline-flex items-center gap-2 text-lg font-medium underline-offset-4 hover:underline md:text-base"
        transitionTypes={["nav-forward"]}
      >
        {component.name}
      </Link>
    ))}
  </div>
);

export const ComponentsList = ({
  folderName = "Components",
  category,
  base = DEFAULT_BASE_NAME,
  className,
}: {
  folderName?: string;
  category?: string;
  base?: string;
  className?: string;
}) => {
  const folder = getFolder(folderName);
  if (!folder) {
    return null;
  }

  if (category) {
    let pages: PageTreePage[] | undefined;

    if (isComponentsFolder(folder)) {
      const baseFolder = findChildFolder(folder, base);
      const categoryFolder = baseFolder
        ? findChildFolder(baseFolder, category)
        : undefined;
      pages = categoryFolder ? getFolderPages(categoryFolder) : undefined;
    } else {
      pages = getFolderSections(folder, base).find(
        (section) => section.id === category
      )?.pages;
    }

    return pages && pages.length > 0 ? (
      <ComponentGrid className={className} pages={pages} />
    ) : null;
  }

  if (isComponentsFolder(folder)) {
    return null;
  }

  const pages = getFolderPages(folder, base);
  const fallback = pages.length > 0 ? pages : getFolderPages(folder);

  return fallback.length > 0 ? (
    <ComponentGrid className={className} pages={fallback} />
  ) : null;
};
