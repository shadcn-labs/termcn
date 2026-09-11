import { cn } from "cn";

import { SITE } from "@/constants/site";

export { cn };

export const absoluteUrl = (path: string) => `${SITE.URL}${path}`;

export const formatLabelFromSlug = (slug: string): string =>
  slug.replaceAll(
    /(^|-)(\w)/g,
    (_, sep, ch: string) => `${sep ? " " : ""}${ch.toUpperCase()}`
  );
