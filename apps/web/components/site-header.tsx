import type { Locale } from "intlayer";
import { getLocalizedUrl } from "intlayer";
import { useIntlayer } from "next-intlayer/server";
import Link from "next/link";

import { BrandContextMenu } from "@/components/brand-context-menu";
import { CommandMenu } from "@/components/command-menu";
import { LabsNav } from "@/components/labs-nav";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { LogoMark } from "@/components/logo";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { NavItemGithub } from "@/components/nav-item-github";
import { SiteSettings } from "@/components/site-settings";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";
import { source } from "@/lib/source";

export const SiteHeader = ({ locale }: { locale?: string }) => {
  const content = useIntlayer("site-header", locale);

  const navItems = [
    {
      href: getLocalizedUrl(ROUTES.DOCS, locale as Locale),
      label: String(content.navDocs),
    },
    {
      href: getLocalizedUrl(ROUTES.DOCS_COMPONENTS, locale as Locale),
      label: String(content.navComponents),
    },
    {
      href: getLocalizedUrl(ROUTES.DOCS_CHARTS, locale as Locale),
      label: String(content.navCharts),
    },
    {
      href: getLocalizedUrl(ROUTES.DOCS_TEMPLATES, locale as Locale),
      label: String(content.navTemplates),
    },
    {
      href: getLocalizedUrl(ROUTES.SPONSOR, locale as Locale),
      label: String(content.navSponsors),
    },
  ];

  return (
    <header
      className="bg-background sticky top-0 z-50 w-full"
      style={{ viewTransitionName: "site-header" }}
    >
      <div className="container-wrapper 3xl:fixed:px-0 relative px-6">
        <div className="3xl:fixed:container relative flex h-(--header-height) items-center">
          <MobileNav
            items={navItems}
            tree={source.getPageTree(locale)}
            className="flex lg:hidden mr-2"
          />
          <div className="flex items-center">
            <BrandContextMenu>
              <Button
                asChild
                variant="ghost"
                size="icon-sm"
                className="hover:bg-transparent focus-visible:bg-transparent dark:hover:bg-transparent lg:size-9"
                sound="click"
              >
                <Link
                  href="https://shadcn-labs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LogoMark className="size-5" />
                </Link>
              </Button>
            </BrandContextMenu>
            <span className="text-muted-foreground/50 ml-1">/</span>
            <LabsNav />
          </div>
          <MainNav items={navItems} className="hidden lg:flex" />
          <div className="ml-auto flex items-center gap-1 md:gap-2 md:flex-1 md:justify-end">
            <div className="hidden w-full flex-1 md:flex md:w-auto md:flex-none">
              <CommandMenu
                navItems={navItems}
                tree={source.getPageTree(locale)}
              />
            </div>
            <Separator
              className="hidden h-5! md:block"
              orientation="vertical"
            />
            <NavItemGithub />
            <Separator
              className="hidden h-5! md:block"
              orientation="vertical"
            />
            <LocaleSwitcher className="hidden md:flex" />
            <Separator
              className="hidden h-5! md:block"
              orientation="vertical"
            />
            <SiteSettings />
          </div>
        </div>
      </div>
    </header>
  );
};
