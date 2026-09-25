import { getMultilingualUrls } from "intlayer";
import type { MetadataRoute } from "next";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { source } from "@/lib/source";

const languageAlternates = (path: string) => {
  const localized = getMultilingualUrls(path);

  return Object.fromEntries(
    Object.entries(localized).map(([locale, localizedPath]) => [
      locale,
      `${SITE.URL}${localizedPath}`,
    ])
  );
};

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      alternates: { languages: languageAlternates(ROUTES.HOME) },
      changeFrequency: "monthly",
      lastModified: new Date(),
      priority: 1,
      url: SITE.URL,
    },
    {
      alternates: { languages: languageAlternates(ROUTES.SPONSOR) },
      changeFrequency: "monthly",
      lastModified: new Date(),
      priority: 0.5,
      url: `${SITE.URL}${ROUTES.SPONSOR}`,
    },
  ];

  const docPages: MetadataRoute.Sitemap = source.getPages().map((page) => ({
    alternates: { languages: languageAlternates(page.url) },
    changeFrequency: "weekly" as const,
    lastModified: new Date(),
    priority: page.url === ROUTES.DOCS ? 0.9 : 0.8,
    url: `${SITE.URL}${page.url}`,
  }));

  return [...staticPages, ...docPages];
}
