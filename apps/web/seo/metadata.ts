import type { Metadata } from "next";

import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

interface CreatePageMetadataOptions {
  description?: string;
  noIndex?: boolean;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogTitle?: string;
  ogType?: "article" | "website";
  path: string;
  title: string;
}

export const createPageMetadata = (
  options: CreatePageMetadataOptions
): Metadata => {
  const {
    description,
    noIndex = false,
    ogDescription,
    ogImage,
    ogImageAlt,
    ogTitle,
    ogType = "website",
    path,
    title,
  } = options;

  const canonical = path.startsWith(ROUTES.HOME)
    ? path
    : `${ROUTES.HOME}${path}`;
  const markdownAlternate =
    canonical === ROUTES.DOCS || canonical.startsWith(`${ROUTES.DOCS}/`)
      ? `${canonical}.md`
      : undefined;
  const resolvedOgImage =
    ogImage ?? `${ROUTES.OG}${canonical === ROUTES.HOME ? "" : canonical}`;
  const resolvedTitle = ogTitle ?? title;

  return {
    alternates: {
      canonical,
      ...(markdownAlternate && {
        types: {
          "text/markdown": markdownAlternate,
        },
      }),
    },
    description,
    openGraph: {
      description: ogDescription ?? description,
      images: [
        {
          alt: ogImageAlt ?? resolvedTitle,
          height: 630,
          url: resolvedOgImage,
          width: 1200,
        },
      ],
      locale: "en_US",
      siteName: SITE.NAME,
      title: resolvedTitle,
      type: ogType,
      url: `${SITE.URL}${canonical}`,
    },
    title,
    twitter: {
      card: "summary_large_image",
      creator: SITE.AUTHOR.TWITTER,
      description: ogDescription ?? description,
      images: [resolvedOgImage],
      site: SITE.AUTHOR.TWITTER,
      title: resolvedTitle,
    },
    ...(noIndex && {
      robots: {
        follow: false,
        index: false,
      },
    }),
  };
};

export const baseMetadata: Metadata = {
  alternates: {
    canonical: ROUTES.HOME,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE.NAME,
  },
  applicationName: SITE.NAME,
  authors: [{ name: SITE.AUTHOR.NAME, url: LINK.PORTFOLIO }],
  category: "technology",
  creator: SITE.AUTHOR.NAME,
  description: SITE.DESCRIPTION.LONG,
  icons: {
    apple: {
      sizes: "180x180",
      type: "image/png",
      url: "/apple-touch-icon.png",
    },
    icon: [
      {
        sizes: "32x32",
        url: "/favicon.ico",
      },
      {
        media: "(prefers-color-scheme: light)",
        sizes: "any",
        type: "image/svg+xml",
        url: "/favicon.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        sizes: "any",
        type: "image/svg+xml",
        url: "/favicon-dark.svg",
      },
    ],
    shortcut: "/favicon-16x16.png",
  },
  keywords: [...SITE.KEYWORDS],
  metadataBase: new URL(SITE.URL),
  openGraph: {
    description: SITE.DESCRIPTION.LONG,
    images: [
      {
        alt: SITE.NAME,
        height: 630,
        url: SITE.OG_IMAGE,
        width: 1200,
      },
    ],
    locale: "en_US",
    siteName: SITE.NAME,
    title: SITE.NAME,
    type: "website",
    url: SITE.URL,
  },
  publisher: SITE.AUTHOR.NAME,
  title: {
    default: `${SITE.NAME} - ${SITE.DESCRIPTION.SHORT}`,
    template: `%s | ${SITE.NAME}`,
  },
  twitter: {
    card: "summary_large_image",
    creator: SITE.AUTHOR.TWITTER,
    description: SITE.DESCRIPTION.LONG,
    images: [SITE.OG_IMAGE],
    site: SITE.AUTHOR.TWITTER,
    title: SITE.NAME,
  },
};
