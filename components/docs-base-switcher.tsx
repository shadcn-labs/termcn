import Link from "next/link";

import { cn } from "@/lib/utils";
import { BASE_NAMES, BASES, getBase } from "@/registry/bases";
import type { BaseName } from "@/registry/bases";

type DocsBaseSwitcherSection = "components" | "templates" | "themes" | "charts";

const DOCS_BASE_SWITCHER_SECTIONS = new Set<DocsBaseSwitcherSection>([
  "components",
  "templates",
  "themes",
  "charts",
]);

const isDocsBaseSwitcherSection = (
  section: string
): section is DocsBaseSwitcherSection =>
  DOCS_BASE_SWITCHER_SECTIONS.has(section as DocsBaseSwitcherSection);

export const getDocsBaseSwitcherProps = (
  slug: string[] | undefined
): {
  section: DocsBaseSwitcherSection;
  base: string;
  slug: string;
} | null => {
  if (!slug || slug.length < 3) {
    return null;
  }

  const [section, base, ...rest] = slug;

  if (
    !BASE_NAMES.includes(base as BaseName) ||
    !isDocsBaseSwitcherSection(section) ||
    !rest.length
  ) {
    return null;
  }

  if (section === "templates" || section === "themes" || section === "charts") {
    return { base, section, slug: rest[0] };
  }

  if (rest.length < 2) {
    return null;
  }

  return { base, section, slug: rest.join("/") };
};

export const DocsBaseSwitcher = ({
  base,
  slug,
  section,
  className,
}: {
  base: string;
  slug: string;
  section: DocsBaseSwitcherSection;
  className?: string;
}) => {
  const activeBase = getBase(base as (typeof BASES)[number]["name"]);

  return (
    <div className={cn("inline-flex w-full items-center gap-6", className)}>
      {BASES.map((baseItem) => (
        <Link
          key={baseItem.name}
          href={`/docs/${section}/${baseItem.name}/${slug}`}
          data-active={base === baseItem.name}
          className="relative inline-flex items-center justify-center gap-1 pt-1 pb-0.5 text-base font-medium text-muted-foreground transition-colors after:absolute after:inset-x-0 after:bottom-[-4px] after:h-0.5 after:bg-foreground after:opacity-0 after:transition-opacity hover:text-foreground data-[active=true]:text-foreground data-[active=true]:after:opacity-100"
        >
          {baseItem.title}
        </Link>
      ))}
      {activeBase?.meta?.logo && (
        <div
          className="ml-auto shrink-0 [&_svg]:h-4"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: activeBase.meta.logo,
          }}
        />
      )}
    </div>
  );
};
