import { NextResponse } from "next/server";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { getChangelogPages } from "@/lib/changelog";
import type { ChangelogPageData } from "@/lib/changelog";

export const revalidate = false;

export const GET = () => {
  const pages = getChangelogPages();

  const items = pages
    .map((page) => {
      const data = page.data as ChangelogPageData;
      const date = page.date?.toUTCString() ?? new Date().toUTCString();
      const link = `${SITE.URL}${page.url}`;

      return `    <item>
      <title><![CDATA[${data.title}]]></title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description><![CDATA[${data.description || ""}]]></description>
      <pubDate>${date}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE.NAME} Changelog</title>
    <link>${SITE.URL}</link>
    <description>${SITE.DESCRIPTION.LONG}</description>
    <language>en-us</language>
    <atom:link href="${SITE.URL}${ROUTES.RSS}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
