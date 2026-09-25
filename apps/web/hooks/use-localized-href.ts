"use client";

import { getPathWithoutLocale } from "intlayer";
import { useLocale } from "next-intlayer";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

import { localizeHref } from "@/lib/url";

/**
 * Returns a stable rewriter for programmatic navigation (`router.push`), so
 * keyboard shortcuts and command-menu jumps stay inside the active locale.
 */
export const useLocalizedHref = () => {
  const { locale } = useLocale();

  return useCallback((href: string) => localizeHref(href, locale), [locale]);
};

/**
 * Current pathname with the locale prefix removed (`/fr/docs/x` → `/docs/x`),
 * for comparing against `ROUTES.*` and parsing docs structure.
 * Unlike `next-intlayer`'s `usePathname`, it never appends search params.
 */
export const usePathnameWithoutLocale = () =>
  getPathWithoutLocale(usePathname());
