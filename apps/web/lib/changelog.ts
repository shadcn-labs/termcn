import fs from "node:fs";

import fm from "front-matter";

import { source } from "@/lib/source";

export interface ChangelogPageData {
  title: string;
  description?: string;
}

export type ChangelogPage = ReturnType<typeof source.getPages>[number] & {
  date: Date | null;
};

// Reads the date from the frontmatter of a changelog file.
export const getDateFromFile = (absolutePath: string | undefined) => {
  if (!absolutePath) {
    return null;
  }

  try {
    const content = fs.readFileSync(absolutePath, "utf-8");
    const { attributes } = fm<{ date?: string | Date }>(content);
    if (attributes.date) {
      return new Date(attributes.date);
    }
  } catch {
    // File not found or parse error.
  }
  return null;
};

// Gets all changelog pages sorted by date descending.
export const getChangelogPages = (locale?: string) =>
  source
    .getPages(locale)
    .filter((page) => page.slugs[0] === "changelog" && page.slugs.length > 1)
    .map((page) => ({
      ...page,
      date: getDateFromFile(page.absolutePath),
    }))
    .toSorted((a, b) => {
      const dateA = a.date?.getTime() ?? 0;
      const dateB = b.date?.getTime() ?? 0;
      return dateB - dateA;
    });
