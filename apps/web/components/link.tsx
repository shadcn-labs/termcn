"use client";

import { useLocale } from "next-intlayer";
import NextLink from "next/link";

import { localizeHref } from "@/lib/url";

/**
 * `next/link` that keeps navigation inside the active locale.
 *
 * Internal string hrefs (`/docs`, `/fr/docs`) are rewritten to the current
 * locale; external URLs, `UrlObject` hrefs and locale-free routes
 * (`/llms.txt`, `/r/...`) pass through unchanged.
 */
export const Link = ({ href, ...props }: React.ComponentProps<typeof NextLink>) => {
  const { locale } = useLocale();

  return (
    <NextLink
      href={typeof href === "string" ? localizeHref(href, locale) : href}
      {...props}
    />
  );
};
