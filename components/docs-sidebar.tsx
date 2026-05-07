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
import {
  EXCLUDED_SECTIONS,
  isComponentsFolder,
  isTemplatesFolder,
} from "@/lib/docs";
import {
  getCategoryFolders,
  getCurrentBase,
  getFolderPages,
} from "@/lib/page-tree";
import type { source } from "@/lib/source";

const TOP_LEVEL_SECTIONS = [
  { href: ROUTES.DOCS, name: "Introduction" },
  { href: ROUTES.DOCS_INSTALLATION, name: "Installation" },
  { href: ROUTES.DOCS_COMPONENTS, name: "Components" },
  { href: ROUTES.DOCS_TEMPLATES, name: "Templates" },
  { href: ROUTES.DOCS_THEMING, name: "Theming" },
  { href: ROUTES.DOCS_MCP, name: "MCP" },
  { href: ROUTES.DOCS_REGISTRY, name: "Registry" },
  { href: ROUTES.LLMS, name: "llms.txt" },
];

const MENU_BUTTON_CLS =
  "relative h-[30px] w-fit overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48";

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
            <SidebarMenuItem key={page.url}>
              <SidebarMenuButton
                asChild
                isActive={page.url === pathname}
                className={MENU_BUTTON_CLS}
                sound="click"
              >
                <Link href={page.url} transitionTypes={["nav-forward"]}>
                  <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />
                  {page.name}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
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
                <SidebarMenuItem key={name}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      href === "/docs"
                        ? pathname === href
                        : pathname.startsWith(href)
                    }
                    className={MENU_BUTTON_CLS}
                    sound="click"
                  >
                    <Link href={href} transitionTypes={["nav-forward"]}>
                      <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />
                      {name}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {tree.children.map((item) => {
          if (item.type !== "folder") {
            return null;
          }
          if (EXCLUDED_SECTIONS.has(item.$id ?? "")) {
            return null;
          }

          if (isComponentsFolder(item)) {
            return getCategoryFolders(item, currentBase).map((category) => (
              <SidebarPageGroup
                key={category.$id}
                label={category.name}
                pages={getFolderPages(category)}
                pathname={pathname}
              />
            ));
          }

          if (isTemplatesFolder(item)) {
            return [
              <SidebarPageGroup
                key={item.$id}
                label={item.name}
                pages={getFolderPages(item, currentBase)}
                pathname={pathname}
              />,
            ];
          }

          return (
            <SidebarPageGroup
              key={item.$id}
              label={item.name}
              pages={getFolderPages(item)}
              pathname={pathname}
            />
          );
        })}
        <div className="sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t from-background via-background/80 to-background/50 blur-xs" />
      </SidebarContent>
    </Sidebar>
  );
};
