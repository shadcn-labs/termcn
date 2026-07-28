"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BlueskyIcon,
  DiscordIcon,
  GithubIcon,
  XIcon,
} from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE, UTM_PARAMS } from "@/constants/site";
import { useFeedback } from "@/hooks/use-feedback";
import { addQueryParams } from "@/lib/url";
import { cn } from "@/lib/utils";

const footerSocialLinks = [
  { href: LINK.GITHUB, icon: GithubIcon, label: "GitHub" },
  { href: LINK.DISCORD, icon: DiscordIcon, label: "Discord" },
  { href: LINK.X_SHADCN_LABS, icon: XIcon, label: "X" },
  { href: LINK.BLUESKY, icon: BlueskyIcon, label: "Bluesky" },
] as const;

const footerSections = [
  {
    links: [
      { href: ROUTES.HOME, label: "Home" },
      { href: ROUTES.DOCS, label: "Docs" },
      { href: ROUTES.DOCS_COMPONENTS, label: "Components" },
      { href: ROUTES.DOCS_CHARTS, label: "Charts" },
      { href: ROUTES.DOCS_TEMPLATES, label: "Templates" },
      { href: ROUTES.SPONSOR, label: "Sponsors" },
      { href: ROUTES.TERMCN_SKILL, label: "termcn.md" },
      { href: ROUTES.PRO, label: "Get Pro" },
    ],
    title: "Site",
  },
  {
    links: [
      { href: ROUTES.DOCS, label: "Introduction" },
      { href: ROUTES.DOCS_INSTALLATION, label: "Installation" },
      { href: ROUTES.DOCS_MCP, label: "MCP" },
      { href: ROUTES.DOCS_REGISTRY, label: "Registry" },
      { href: ROUTES.DOCS_CHANGELOG, label: "Changelog" },
    ],
    title: "Docs",
  },
  {
    links: [
      { href: ROUTES.SIGN_IN, label: "Sign in" },
      { href: ROUTES.ACCOUNT, label: "Account" },
      { href: ROUTES.TERMS, label: "Terms" },
      { href: ROUTES.PRIVACY, label: "Privacy" },
      { href: ROUTES.LICENSE, label: "License" },
      { href: ROUTES.EULA, label: "EULA" },
      { href: ROUTES.DPA, label: "DPA" },
    ],
    title: "Legal & Account",
  },
  {
    links: [
      { href: LINK.AGENTCN, label: "agentcn" },
      { href: LINK.FRAMECN, label: "framecn" },
      { href: LINK.OGIMAGECN, label: "ogimagecn" },
      { href: LINK.MCPCN, label: "mcpcn" },
      { href: LINK.EMAILCN, label: "emailcn" },
    ],
    title: "More",
  },
] as const;

export const SiteFooter = () => {
  const pathname = usePathname();
  const playClick = useFeedback({ sound: "click" });
  const isDocs =
    pathname === ROUTES.DOCS || pathname.startsWith(`${ROUTES.DOCS}/`);

  return (
    <footer
      className="group-has-[.section-soft]/body:bg-surface/40 3xl:fixed:bg-transparent group-has-[.docs-nav]/body:pb-20 group-has-[.docs-nav]/body:sm:pb-0 dark:bg-transparent"
      style={{ viewTransitionName: "site-footer" }}
    >
      <div className="container-wrapper">
        <div
          className={cn(
            "py-12 sm:py-16 lg:py-20",
            isDocs ? "3xl:fixed:container 3xl:fixed:px-3" : "container"
          )}
        >
          <div className={cn(isDocs && "px-4 lg:pr-8 lg:pl-12")}>
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,4fr)] lg:gap-10">
              <div className="space-y-4">
                <Link
                  className="inline-flex items-center gap-2 text-base font-medium"
                  href={ROUTES.HOME}
                  onClick={playClick}
                  prefetch={false}
                >
                  <LogoMark className="size-5" />
                  {SITE.NAME}
                </Link>
                <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                  Beautifully designed terminal UI components for Ink and
                  OpenTUI.
                </p>
                <nav
                  aria-label="Social links"
                  className="flex items-center gap-1"
                >
                  {footerSocialLinks.map((social) => {
                    const Icon = social.icon;

                    return (
                      <a
                        aria-label={social.label}
                        className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-[3px]"
                        href={social.href}
                        key={social.href}
                        onClick={playClick}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Icon />
                      </a>
                    );
                  })}
                </nav>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4 lg:gap-x-10">
                {footerSections.map((section) => (
                  <nav aria-label={section.title} key={section.title}>
                    <h2 className="text-sm font-medium">{section.title}</h2>
                    <ul className="mt-4 space-y-3">
                      {section.links.map((link) => {
                        const className = cn(
                          "text-muted-foreground hover:text-foreground text-sm transition-colors",
                          link.href === ROUTES.TERMCN_SKILL && "font-mono"
                        );
                        const isExternal = link.href.startsWith("http");

                        return (
                          <li key={link.href}>
                            {isExternal ? (
                              <a
                                className={className}
                                href={link.href}
                                onClick={playClick}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                {link.label}
                              </a>
                            ) : (
                              <Link
                                className={className}
                                href={link.href}
                                onClick={playClick}
                                prefetch={false}
                              >
                                {link.label}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                ))}
              </div>
            </div>

            <div className="text-muted-foreground mt-14 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p>
                Created by{" "}
                <a
                  className="text-foreground hover:underline"
                  href={addQueryParams(LINK.PORTFOLIO, UTM_PARAMS)}
                  onClick={playClick}
                  rel="noreferrer"
                  target="_blank"
                >
                  {SITE.AUTHOR.NAME}
                </a>
              </p>
              <p>
                <a
                  className="hover:text-foreground transition-colors"
                  href={LINK.SHADCN_LABS}
                  onClick={playClick}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  © 2026 Shadcn Labs
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
