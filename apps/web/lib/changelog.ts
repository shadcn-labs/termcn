import fs from "node:fs";
import path from "node:path";

import fm from "front-matter";

import { DOCS_DIR } from "@/lib/docs";
import { source } from "@/lib/source";

export interface ChangelogPageData {
  title: string;
  description?: string;
}

export type ChangelogPage = ReturnType<typeof source.getPages>[number] & {
  date: Date | null;
};

const DOCS_ROOT = path.join(process.cwd(), DOCS_DIR);

const resolveSourceFile = (slugs: string[]): string | null => {
  const relative = `${path.join(...slugs)}.mdx`;

  const direct = path.join(DOCS_ROOT, relative);
  if (fs.existsSync(direct)) {
    return direct;
  }

  for (const entry of fs.readdirSync(DOCS_ROOT, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name.startsWith("(")) {
      const candidate = path.join(DOCS_ROOT, entry.name, relative);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return null;
};

// Reads the date from the frontmatter of a changelog file.
export const getDateFromFile = (slugs: string[]) => {
  const filePath = resolveSourceFile(slugs);
  if (!filePath) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
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
export const getChangelogPages = () =>
  source
    .getPages()
    .filter((page) => page.slugs[0] === "changelog" && page.slugs.length > 1)
    .map((page) => ({
      ...page,
      date: getDateFromFile(page.slugs),
    }))
    .toSorted((a, b) => {
      const dateA = a.date?.getTime() ?? 0;
      const dateB = b.date?.getTime() ?? 0;
      return dateB - dateA;
    });
