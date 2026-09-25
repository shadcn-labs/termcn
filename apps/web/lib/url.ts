import { getLocalizedUrl, getPathWithoutLocale } from "intlayer";

/**
 * Route prefixes served outside the `[locale]` segment (route handlers, static
 * registry files, well-known documents). They must never gain a locale prefix.
 */
const UNLOCALIZED_PREFIXES = ["/api/", "/r/", "/.well-known/"];

const isLocalizablePath = (href: string) => {
  if (!href.startsWith("/")) {
    return false;
  }
  const [pathname] = href.split(/[?#]/);

  return (
    !UNLOCALIZED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) &&
    // `/llms.txt`, `/rss.xml`, `/docs/installation.md`, ... stay locale-free.
    !/\.[a-z0-9]+$/i.test(pathname)
  );
};

/**
 * Rewrites an app-internal href so navigation stays inside `locale`.
 * Idempotent: an href that already carries a locale prefix is re-localized,
 * external URLs and locale-free routes are returned untouched.
 */
export const localizeHref = (href: string, locale: string) =>
  isLocalizablePath(href)
    ? getLocalizedUrl(getPathWithoutLocale(href), locale)
    : href;

export const urlToName = (url: string) => url.replace(/(^\w+:|^)\/\//, "");

export const addQueryParams = (
  urlString: string,
  query: Record<string, string>
): string => {
  try {
    const url = new URL(urlString);

    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }

    return url.toString();
  } catch {
    return urlString;
  }
};
