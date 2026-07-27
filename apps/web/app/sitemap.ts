import type { MetadataRoute } from "next";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { source } from "@/lib/source";

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
      ROUTES.TERMCN_SKILL,
      ROUTES.LICENSE,
      ROUTES.TERMS,
      ROUTES.PRIVACY,
      ROUTES.EULA,
      ROUTES.DPA,
    ].map((route) => ({
      changeFrequency: "monthly" as const,
      lastModified: new Date(),
      priority: route === ROUTES.PRO ? 0.9 : 0.4,
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
