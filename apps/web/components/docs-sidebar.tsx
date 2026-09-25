"use client";

import { getPathWithoutLocale } from "intlayer";
import { useIntlayer } from "next-intlayer";

import { Link } from "@/components/link";
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
import { TOP_LEVEL_SECTIONS } from "@/constants/nav";
import { ROUTES } from "@/constants/routes";
import { usePathnameWithoutLocale } from "@/hooks/use-localized-href";
import {
  getDocsSidebarPanel,
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
  getTreeGroups,
} from "@/lib/page-tree";
import type { PageTreeFolder, PageTreeRoot } from "@/lib/page-tree";

const TOP_LEVEL_SECTION_KEYS: Record<
  string,
  | "changelog"
  | "charts"
  | "components"
  | "installation"
  | "introduction"
  | "llmsTxt"
  | "mcp"
  | "registry"
  | "templates"
  | "theming"
> = {
  Changelog: "changelog",
  Charts: "charts",
  Components: "components",
  Installation: "installation",
  Introduction: "introduction",
  MCP: "mcp",
  Registry: "registry",
  Templates: "templates",
  Theming: "theming",
  "llms.txt": "llmsTxt",
};

const SidebarMenuItemLink = ({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) => {
  const content = useIntlayer("docs-sidebar");

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className="relative h-[30px] w-fit overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48"
        isActive={isActive}
      >
        <Link href={href}>
          <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />
          {children}
          {PAGES_NEW.includes(getPathWithoutLocale(href)) && (
            <span
              className="flex size-2 rounded-full bg-blue-500"
              title={String(content.new)}
            />
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

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
              isActive={getPathWithoutLocale(page.url) === pathname}
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
  tree: PageTreeRoot;
}

const findTopLevelFolder = (
  tree: PageTreeRoot,
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
  const content = useIntlayer("docs-sidebar");
  const folder = findTopLevelFolder(tree, isTemplatesFolder);
  if (!folder) {
    return null;
  }

  return (
    <SidebarPageGroup
      label={content.templates}
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
  const content = useIntlayer("docs-sidebar");
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
      <SidebarPageGroup
        label={content.basic}
        pages={charts}
        pathname={pathname}
      />
      <SidebarPageGroup
        label={content.dither}
        pages={dither}
        pathname={pathname}
      />
    </>
  );
};

const ThemesSidebarPanel = ({
  currentBase,
  pathname,
  tree,
}: SidebarPanelProps) => {
  const content = useIntlayer("docs-sidebar");
  const folder = findTopLevelFolder(tree, isThemesFolder);
  if (!folder) {
    return null;
  }

  return (
    <SidebarPageGroup
      label={content.themes}
      pages={getFolderPages(folder, currentBase)}
      pathname={pathname}
    />
  );
};

export const DocsSidebar = ({
  tree,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  tree: PageTreeRoot;
}) => {
  const content = useIntlayer("docs-sidebar");
  const pathname = usePathnameWithoutLocale();
  const currentBase = getCurrentBase(pathname);
  const panel = getDocsSidebarPanel(pathname);
  const treeGroups = getTreeGroups(tree, currentBase);

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
    if (panel === "themes") {
      return <ThemesSidebarPanel {...panelProps} />;
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
            {content.sections}
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
                  {TOP_LEVEL_SECTION_KEYS[name]
                    ? content[TOP_LEVEL_SECTION_KEYS[name]]
                    : name}
                </SidebarMenuItemLink>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {panel
          ? renderCatalogPanel()
          : treeGroups.map((group) => (
              <SidebarPageGroup
                key={group.label}
                label={group.label}
                pages={group.pages}
                pathname={pathname}
              />
            ))}
        <div className="sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t from-background via-background/80 to-background/50 blur-xs" />
      </SidebarContent>
    </Sidebar>
  );
};
