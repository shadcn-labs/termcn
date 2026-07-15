"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes";
import { TOP_LEVEL_SECTIONS } from "@/constants/site";
import {
  EXCLUDED_SECTIONS,
  getDocsSidebarPanel,
  isCatalogFolder,
  isChartsFolder,
  isComponentsFolder,
  isDitherChartUrl,
  isTemplatesFolder,
  isThemesFolder,
  PAGES_NEW,
} from "@/lib/docs";
import {
  getCategoryFolders,
  getCurrentBase,
  getFolderPages,
} from "@/lib/page-tree";
import type { PageTreeFolder } from "@/lib/page-tree";
import type { source } from "@/lib/source";

const SidebarMenuItemLink = ({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) => (
  <SidebarMenuItem>
    <SidebarMenuButton
      asChild
      className="relative h-[30px] w-fit overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48"
      isActive={isActive}
    >
      <Link href={href}>
        <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />
        {children}
        {PAGES_NEW.includes(href) && (
          <span className="flex size-2 rounded-full bg-blue-500" title="New" />
        )}
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
);

const SidebarPageGroup = ({
  label,
  pages,
  pathname,
}: {
  label: React.ReactNode;
  pages: { url: string; name: React.ReactNode }[];
  pathname: string;
}) => {
  if (pages.length === 0) {
    return null;
  }
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground font-medium">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {pages.map((page) => (
            <SidebarMenuItemLink
              key={page.url}
              href={page.url}
              isActive={page.url === pathname}
            >
              {page.name}
            </SidebarMenuItemLink>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

interface SidebarPanelProps {
  currentBase: string;
  pathname: string;
  tree: typeof source.pageTree;
}

const findTopLevelFolder = (
  tree: typeof source.pageTree,
  predicate: (folder: PageTreeFolder) => boolean
) =>
  tree.children.find(
    (item): item is PageTreeFolder => item.type === "folder" && predicate(item)
  );

const ComponentsSidebarPanel = ({
  currentBase,
  pathname,
  tree,
}: SidebarPanelProps) => {
  const folder = findTopLevelFolder(tree, isComponentsFolder);
  if (!folder) {
    return null;
  }

  return getCategoryFolders(folder, currentBase).map((category) => (
    <SidebarPageGroup
      key={category.$id}
      label={category.name}
      pages={getFolderPages(category)}
      pathname={pathname}
    />
  ));
};

const TemplatesSidebarPanel = ({
  currentBase,
  pathname,
  tree,
}: SidebarPanelProps) => {
  const folder = findTopLevelFolder(tree, isTemplatesFolder);
  if (!folder) {
    return null;
  }

  return (
    <SidebarPageGroup
      label="Templates"
      pages={getFolderPages(folder, currentBase)}
      pathname={pathname}
    />
  );
};

const ChartsSidebarPanel = ({
  currentBase,
  pathname,
  tree,
}: SidebarPanelProps) => {
  const folder = findTopLevelFolder(tree, isChartsFolder);
  if (!folder) {
    return null;
  }

  const pages = getFolderPages(folder, currentBase).filter(
    (page) => page.url !== `${ROUTES.DOCS_CHARTS}/${currentBase}`
  );
  const charts = pages.filter((page) => !isDitherChartUrl(page.url));
  const dither = pages.filter((page) => isDitherChartUrl(page.url));

  return (
    <>
      <SidebarPageGroup label="Charts" pages={charts} pathname={pathname} />
      <SidebarPageGroup label="Dither" pages={dither} pathname={pathname} />
    </>
  );
};

export const DocsSidebar = ({
  tree,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  tree: typeof source.pageTree;
}) => {
  const pathname = usePathname();
  const currentBase = getCurrentBase(pathname);
  const panel = getDocsSidebarPanel(pathname);

  const renderCatalogPanel = () => {
    const panelProps = { currentBase, pathname, tree };
    if (panel === "components") {
      return <ComponentsSidebarPanel {...panelProps} />;
    }
    if (panel === "templates") {
      return <TemplatesSidebarPanel {...panelProps} />;
    }
    if (panel === "charts") {
      return <ChartsSidebarPanel {...panelProps} />;
    }
    return null;
  };

  return (
    <Sidebar
      className="flex-col text-sidebar-foreground sticky top-[calc(var(--header-height)+0.6rem)] z-30 hidden h-[calc(100svh-10rem)] overscroll-none bg-transparent [--sidebar-menu-width:--spacing(48)] lg:flex"
      collapsible="none"
      {...props}
    >
      <div className="h-9" />
      <div className="absolute top-8 z-10 h-8 w-(--sidebar-menu-width) shrink-0 bg-linear-to-b from-background via-background/80 to-background/50 blur-xs" />
      <div className="absolute top-12 right-2 bottom-0 hidden h-full w-px bg-linear-to-b from-transparent via-border to-transparent lg:flex" />
      <SidebarContent className="mx-auto no-scrollbar w-(--sidebar-menu-width) overflow-x-hidden px-2">
        <SidebarGroup className="pt-6">
          <SidebarGroupLabel className="text-muted-foreground font-medium">
            Sections
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {TOP_LEVEL_SECTIONS.map(({ name, href }) => (
                <SidebarMenuItemLink
                  key={name}
                  href={href}
                  isActive={
                    href === ROUTES.DOCS
                      ? pathname === href
                      : pathname.startsWith(href)
                  }
                >
                  {name}
                </SidebarMenuItemLink>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {panel
          ? renderCatalogPanel()
          : tree.children.map((item) => {
              if (item.type !== "folder") {
                return null;
              }
              if (EXCLUDED_SECTIONS.has(item.$id ?? "")) {
                return null;
              }
              if (isCatalogFolder(item)) {
                return null;
              }

              return (
                <SidebarPageGroup
                  key={item.$id}
                  label={item.name}
                  pages={getFolderPages(
                    item,
                    isThemesFolder(item) ? currentBase : undefined
                  )}
                  pathname={pathname}
                />
              );
            })}
        <div className="sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t from-background via-background/80 to-background/50 blur-xs" />
      </SidebarContent>
    </Sidebar>
  );
};
