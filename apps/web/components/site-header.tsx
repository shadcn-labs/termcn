import Link from "next/link";

import { BrandContextMenu } from "@/components/brand-context-menu";
import { CommandMenu } from "@/components/command-menu";
import { LogoMark } from "@/components/logo";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { ModeSwitcher } from "@/components/mode-switcher";
import { NavItemGithub } from "@/components/nav-item-github";
import { HeaderMenu } from "@/components/site-settings";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { source } from "@/lib/source";

const navItems = [
  { href: ROUTES.DOCS, label: "Docs" },
  { href: ROUTES.DOCS_COMPONENTS, label: "Components" },
  { href: ROUTES.DOCS_CHARTS, label: "Charts" },
  { href: ROUTES.DOCS_TEMPLATES, label: "Templates" },
  { href: ROUTES.SPONSOR, label: "Sponsors" },
  { href: ROUTES.TERMCN_SKILL, label: "termcn.md" },
];

export const SiteHeader = () => (
  <header
    className="bg-background sticky top-0 z-50 w-full"
    style={{ viewTransitionName: "site-header" }}
  >
    <div className="container-wrapper 3xl:fixed:px-0 px-6">
      <div className="3xl:fixed:container flex h-(--header-height) items-center gap-2">
        <MobileNav
          items={navItems}
          tree={source.pageTree}
          className="flex xl:hidden"
        />
        <BrandContextMenu>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden size-8 xl:flex"
            sound="click"
          >
            <Link
              href={ROUTES.HOME}
              prefetch={false}
              transitionTypes={["nav-back"]}
            >
              <LogoMark className="size-5" />
              <span className="sr-only">{SITE.NAME}</span>
            </Link>
          </Button>
        </BrandContextMenu>
        <MainNav items={navItems} className="hidden xl:flex" />
        <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
          <div className="hidden w-full flex-1 xl:flex xl:w-auto xl:flex-none">
            <CommandMenu navItems={navItems} tree={source.pageTree} />
          </div>
          <NavItemGithub />
          <ModeSwitcher />
          <Button asChild size="sm" sound="click">
            <Link href={ROUTES.PRO} prefetch={false}>
              <span className="xl:hidden">Pro</span>
              <span className="hidden xl:inline">Get Pro</span>
            </Link>
          </Button>
          <HeaderMenu />
        </div>
      </div>
    </div>
  </header>
);
