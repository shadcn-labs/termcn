import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { createPageMetadata } from "@/seo/metadata";

import { CreateBuilder } from "./create-builder";

export const metadata = createPageMetadata({
  description:
    "Choose an Ink or OpenTUI framework, terminal theme, Nerd Font, icon set, and starter template, then generate the exact termcn init command.",
  path: ROUTES.CREATE,
  title: "Create a terminal app",
});

export default function CreatePage() {
  return (
    <div className="section-soft relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden [--customizer-width:--spacing(48)] [--gap:--spacing(4)] md:[--gap:--spacing(6)] 2xl:[--customizer-width:--spacing(56)]">
      <Suspense
        fallback={
          <div className="flex min-h-0 flex-1 flex-col gap-(--gap) p-(--gap) pt-[calc(var(--gap)*0.25)] md:flex-row-reverse">
            <Skeleton className="flex-1 rounded-2xl" />
            <Skeleton className="min-h-[151px] w-full self-start rounded-2xl md:h-full md:max-h-full md:min-h-0 md:w-(--customizer-width)" />
          </div>
        }
      >
        <CreateBuilder />
      </Suspense>
    </div>
  );
}
