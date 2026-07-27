import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { SITE } from "@/constants/site";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const absoluteUrl = (path: string) => `${SITE.URL}${path}`;

export const formatLabelFromSlug = (slug: string): string =>
  slug.replaceAll(
    /(^|-)(\w)/g,
    (_, sep, ch: string) => `${sep ? " " : ""}${ch.toUpperCase()}`
  );
