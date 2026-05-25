import Link from "next/link";

import { isComponentsFolder } from "@/lib/docs";
import type { PageTreeFolder, PageTreePage } from "@/lib/page-tree";
import { getCategoryFolders, getFolderPages } from "@/lib/page-tree";
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

const CategoryGrid = ({
  className,
  categories,
}: {
  className?: string;
  categories: PageTreeFolder[];
}) => (
  <div className={cn("flex flex-col gap-10", className)}>
    {categories.map((cat) => {
      const pages = getFolderPages(cat);
      if (pages.length === 0) {
        return null;
      }

      return (
        <div key={cat.$id}>
          <h3 className="font-heading mb-4 text-lg font-medium tracking-tight">
            {cat.name}
          </h3>
          <ComponentGrid pages={pages} />
        </div>
      );
    })}
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

  if (!isComponentsFolder(folder)) {
    const pages = getFolderPages(folder, base);
    if (pages.length > 0) {
      return <ComponentGrid className={className} pages={pages} />;
    }
    const allPages = getFolderPages(folder);
    if (allPages.length === 0) {
      return null;
    }
    return <ComponentGrid className={className} pages={allPages} />;
  }

  const categories = getCategoryFolders(folder, base);

  if (category) {
    const match = categories.find(
      (cat) =>
        cat.$id === category ||
        String(cat.$id ?? "").endsWith(`/${category}`) ||
        (typeof cat.name === "string" &&
          cat.name.toLowerCase() === category.toLowerCase())
    );
    if (!match) {
      return null;
    }
    return (
      <ComponentGrid className={className} pages={getFolderPages(match)} />
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return <CategoryGrid className={className} categories={categories} />;
};
