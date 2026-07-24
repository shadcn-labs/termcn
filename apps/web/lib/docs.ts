import { ROUTES } from "@/constants/routes";

import type { PageTreeFolder } from "./page-tree";
import { formatLabelFromSlug } from "./utils";

export const DOCS_DIR = `content${ROUTES.DOCS}`;

export const EXCLUDED_SECTIONS = new Set([
  "installation",
  "changelog",
  "(root)",
]);

export const isComponentsFolder = (folder: PageTreeFolder) =>
  folder.$id === "components" || folder.name === "Components";

export const isChartsFolder = (folder: PageTreeFolder) =>
  folder.$id === "charts" || folder.name === "Charts";

export const isTemplatesFolder = (folder: PageTreeFolder) =>
  folder.$id === "templates" || folder.name === "Templates";

export const isThemesFolder = (folder: PageTreeFolder) =>
  folder.$id === "themes" || folder.name === "Themes";

export const isCatalogFolder = (folder: PageTreeFolder) =>
  isComponentsFolder(folder) ||
  isTemplatesFolder(folder) ||
  isChartsFolder(folder);

export type DocsSidebarPanel = "components" | "templates" | "charts";

const isPathWithin = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

export const getDocsSidebarPanel = (
  pathname: string
): DocsSidebarPanel | null => {
  if (isPathWithin(pathname, ROUTES.DOCS_COMPONENTS)) {
    return "components";
  }
  if (isPathWithin(pathname, ROUTES.DOCS_TEMPLATES)) {
    return "templates";
  }
  if (isPathWithin(pathname, ROUTES.DOCS_CHARTS)) {
    return "charts";
  }
  return null;
};

export const isDitherChartUrl = (url: string) =>
  url.split("/").at(-1)?.startsWith("dither-") ?? false;

const CHART_REGISTRY_ITEM_BY_SLUG: Record<string, string> = {
  bar: "bar-chart",
  "dither-area": "dither-area-chart",
  "dither-bar": "dither-bar-chart",
  "dither-line": "dither-line-chart",
  "dither-pie": "dither-pie-chart",
  "dither-radar": "dither-radar-chart",
  line: "line-chart",
  pie: "pie-chart",
};

export const getChartRegistryItemName = (slug: string) =>
  CHART_REGISTRY_ITEM_BY_SLUG[slug] ?? slug;

const TITLE_OVERRIDES: Record<string, string> = {
  json: "JSON",
  "qr-code": "QR Code",
};

export const formatTitleFromSlug = (slug: string): string =>
  TITLE_OVERRIDES[slug] ?? formatLabelFromSlug(slug);

export const homeContentRoute = `${ROUTES.LLMS_MD}/content.md`;
export const docsContentRoute = `${ROUTES.LLMS_MD}${ROUTES.DOCS}`;
export const docsImageRoute = `${ROUTES.OG}${ROUTES.DOCS}`;

export const PAGES_NEW: string[] = [
  ROUTES.DOCS_CHANGELOG,
  `${ROUTES.DOCS_CHARTS}/ink/dither-area`,
  `${ROUTES.DOCS_CHARTS}/ink/dither-bar`,
  `${ROUTES.DOCS_CHARTS}/ink/dither-line`,
  `${ROUTES.DOCS_CHARTS}/ink/dither-pie`,
  `${ROUTES.DOCS_CHARTS}/ink/dither-radar`,
  `${ROUTES.DOCS_CHARTS}/ink/dither-sparkline`,
  `${ROUTES.DOCS_CHARTS}/opentui/dither-area`,
  `${ROUTES.DOCS_CHARTS}/opentui/dither-bar`,
  `${ROUTES.DOCS_CHARTS}/opentui/dither-line`,
  `${ROUTES.DOCS_CHARTS}/opentui/dither-pie`,
  `${ROUTES.DOCS_CHARTS}/opentui/dither-radar`,
  `${ROUTES.DOCS_CHARTS}/opentui/dither-sparkline`,
];
