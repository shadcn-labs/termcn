import type { MetadataRoute } from "next";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { getLaunchWeekHref, getLaunchWeeks } from "@/lib/launch-week";
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
    {
      changeFrequency: "daily",
      lastModified: new Date(),
      priority: 0.9,
      url: `${SITE.URL}${ROUTES.LAUNCH_WEEK}`,
    },
  ];

  const docPages: MetadataRoute.Sitemap = source.getPages().map((page) => ({
    changeFrequency: "weekly" as const,
    lastModified: new Date(),
    priority: page.url === ROUTES.DOCS ? 0.9 : 0.8,
    url: `${SITE.URL}${page.url}`,
  }));

  const launchWeekPages: MetadataRoute.Sitemap = getLaunchWeeks().map(
    (week) => ({
      changeFrequency: week.status === "active" ? "daily" : "monthly",
      lastModified: new Date(),
      priority: week.status === "active" ? 0.9 : 0.6,
      url: `${SITE.URL}${getLaunchWeekHref(week)}`,
    })
  );

  return [...staticPages, ...launchWeekPages, ...docPages];
}
