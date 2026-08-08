export const FALLBACK_SITE_ORIGIN = "https://termcn.dev" as const;

const getBaseUrl = () => {
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return process.env.SITE_URL ?? FALLBACK_SITE_ORIGIN;
};

const baseUrl = getBaseUrl();

export const SITE = {
  AUTHOR: {
    NAME: "Aniket Pawar",
    TWITTER: "@alaymanguy",
  },
  DESCRIPTION: {
    LONG: "A collection of beautifully designed, accessible, and customizable terminal UI components. Built on Ink and OpenTUI. Works with shadcn/ui.",
    SHORT: "Beautiful terminal UIs, made simple",
  },
  KEYWORDS: [
    "terminal",
    "ink",
    "react terminal",
    "next.js terminal",
    "shadcn",
    "component registry",
    "react components",
    "next.js",
    "npx shadcn add",
  ] as const,
  NAME: "termcn",
  OG_IMAGE: `${baseUrl}/og.png`,
  REGISTRY: "@termcn",
  URL: baseUrl,
};

export const META_THEME_COLORS = {
  dark: "#0a0a0a",
  light: "#ffffff",
};

export const UTM_PARAMS = {
  utm_source: new URL(baseUrl).hostname,
};
