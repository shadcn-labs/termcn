import type { ReactNode } from "react";

import { Announcement } from "@/components/announcement";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  description: ReactNode;
  descriptionClassName?: string;
  showAnnouncement?: boolean;
  title: ReactNode;
  titleClassName?: string;
}

export const PageHero = ({
  description,
  descriptionClassName,
  showAnnouncement = false,
  title,
  titleClassName,
}: PageHeroProps) => (
  <header className="relative flex flex-col items-center gap-4 text-center">
    {showAnnouncement && (
      <div className="absolute bottom-full left-1/2 mb-4 flex -translate-x-1/2">
        <Announcement />
      </div>
    )}
    <h1
      className={cn(
        "from-foreground via-foreground to-foreground/65 bg-linear-to-b bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl",
        titleClassName
      )}
    >
      {title}
    </h1>
    <p
      className={cn(
        "text-muted-foreground max-w-lg text-base leading-relaxed text-balance",
        descriptionClassName
      )}
    >
      {description}
    </p>
  </header>
);
