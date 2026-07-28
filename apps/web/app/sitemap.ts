import type { MetadataRoute } from "next";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { source } from "@/lib/source";

const getStaticPagePriority = (route: string) => {
  if (route === ROUTES.PRO) {
    return 0.9;
  }
  if (route === ROUTES.STUDIO) {
    return 0.8;
  }
  return 0.4;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      changeFrequency: "monthly",
      lastModified: new Date(),
      priority: 1,
      url: SITE.URL,
    },
    {
      changeFrequency: "monthly",
      lastModified: new Date(),
      priority: 0.5,
      url: `${SITE.URL}${ROUTES.SPONSOR}`,
    },
    ...[
      ROUTES.PRO,
      ROUTES.STUDIO,
      ROUTES.TERMCN_SKILL,
      ROUTES.LICENSE,
      ROUTES.TERMS,
      ROUTES.PRIVACY,
      ROUTES.EULA,
      ROUTES.DPA,
    ].map((route) => ({
      changeFrequency: "monthly" as const,
      lastModified: new Date(),
      priority: getStaticPagePriority(route),
      url: `${SITE.URL}${route}`,
    })),
  ];

  const docPages: MetadataRoute.Sitemap = source.getPages().map((page) => ({
    changeFrequency: "weekly" as const,
    lastModified: new Date(),
    priority: page.url === ROUTES.DOCS ? 0.9 : 0.8,
    url: `${SITE.URL}${page.url}`,
  }));

  return [...staticPages, ...docPages];
}
