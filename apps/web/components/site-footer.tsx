"use client";

import Link from "next/link";

import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE, UTM_PARAMS } from "@/constants/site";
import { useFeedback } from "@/hooks/use-feedback";
import { addQueryParams } from "@/lib/url";

export const SiteFooter = () => {
  const playClick = useFeedback({ sound: "click" });

  return (
    <footer
      className="group-has-[.section-soft]/body:bg-surface/40 3xl:fixed:bg-transparent group-has-[.docs-nav]/body:pb-20 group-has-[.docs-nav]/body:sm:pb-0 dark:bg-transparent"
      style={{ viewTransitionName: "site-footer" }}
    >
      <div className="container-wrapper px-4 xl:px-6">
        <div className="flex min-h-(--footer-height) flex-col items-center justify-center gap-2 py-4">
          <div className="text-muted-foreground w-full px-1 text-center text-xs leading-loose sm:text-sm">
            Built by{" "}
            <a
              className="font-medium underline underline-offset-4"
              href={addQueryParams(LINK.PORTFOLIO, UTM_PARAMS)}
              onClick={playClick}
              rel="noreferrer"
              target="_blank"
            >
              {SITE.AUTHOR.NAME}
            </a>
            . Free components remain available on{" "}
            <a
              className="font-medium underline underline-offset-4"
              href={addQueryParams(LINK.GITHUB, UTM_PARAMS)}
              onClick={playClick}
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
            .
          </div>
          <nav
            aria-label="Legal and account"
            className="text-muted-foreground flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs"
          >
            {[
              [ROUTES.ACCOUNT, "Account"],
              [ROUTES.LICENSE, "License"],
              [ROUTES.TERMS, "Terms"],
              [ROUTES.PRIVACY, "Privacy"],
              [ROUTES.EULA, "EULA"],
              [ROUTES.DPA, "DPA"],
            ].map(([href, label]) => (
              <Link
                className="underline-offset-4 hover:underline"
                href={href}
                key={href}
                onClick={playClick}
                prefetch={false}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};
