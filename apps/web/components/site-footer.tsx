"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoMark } from "@/components/logo";
import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE, UTM_PARAMS } from "@/constants/site";
import { useFeedback } from "@/hooks/use-feedback";
import { addQueryParams } from "@/lib/url";
import { cn } from "@/lib/utils";

const footerSections = [
  {
    links: [
      { href: ROUTES.HOME, label: "Home" },
      { href: ROUTES.DOCS_COMPONENTS, label: "Components" },
      { href: ROUTES.DOCS_CHARTS, label: "Charts" },
      { href: ROUTES.DOCS_TEMPLATES, label: "Templates" },
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
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] lg:gap-10">
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
              </div>

              {footerSections.map((section) => (
                <nav aria-label={section.title} key={section.title}>
                  <h2 className="text-sm font-medium">{section.title}</h2>
                  <ul className="mt-4 space-y-3">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                          href={link.href}
                          onClick={playClick}
                          prefetch={false}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
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
              <p>© 2026 Shadcn Labs</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
