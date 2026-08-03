import { ArrowRightIcon, CheckIcon, CircleDashedIcon } from "lucide-react";
import Link from "next/link";

import { DirectionalTransition } from "@/components/directional-transition";
import { PageHero } from "@/components/page-hero";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import {
  formatLaunchWeekRange,
  getLaunchWeekHref,
  getLaunchWeeks,
} from "@/lib/launch-week";
import type { LaunchWeekData } from "@/lib/launch-week";
import { BreadcrumbJsonLd } from "@/seo/json-ld";
import { createPageMetadata } from "@/seo/metadata";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata = createPageMetadata({
  description:
    "A permanent archive of termcn launch weeks and everything shipped during them.",
  path: ROUTES.LAUNCH_WEEK,
  title: "Launch Weeks",
});

const LaunchWeekCard = ({
  featured = false,
  week,
}: {
  featured?: boolean;
  week: LaunchWeekData;
}) => {
  const StatusIcon = week.status === "active" ? CircleDashedIcon : CheckIcon;

  return (
    <Link
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      href={getLaunchWeekHref(week)}
      transitionTypes={["nav-forward"]}
    >
      <Card className="gap-0 py-0 shadow-none transition-colors group-hover:border-foreground/25">
        <CardContent className="flex items-center justify-between gap-4 p-4 sm:p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={week.status === "active" ? "default" : "outline"}>
                <StatusIcon />
                {week.status === "active" ? "In progress" : "Complete"}
              </Badge>
              {featured && <span className="sr-only">Latest</span>}
            </div>
            <h2 className="mt-3 text-lg font-semibold tracking-tight">
              {week.title}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {formatLaunchWeekRange(week, week.status === "complete")}
            </p>
          </div>
          <ArrowRightIcon className="text-muted-foreground size-4 transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none" />
        </CardContent>
      </Card>
    </Link>
  );
};

export default function LaunchWeeksPage() {
  const [latestWeek] = getLaunchWeeks();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: ROUTES.HOME },
          { name: "Launch Weeks", path: ROUTES.LAUNCH_WEEK },
        ]}
      />
      <DirectionalTransition>
        <div className="container-wrapper">
          <div className="container py-16 md:py-20 lg:py-24">
            <article className="mx-auto w-full max-w-2xl">
              <PageHero
                description={
                  <>
                    Every launch week and everything that shipped, kept in one
                    place.
                  </>
                }
                title="Launch weeks"
              />

              {latestWeek && (
                <div className="mt-8">
                  <LaunchWeekCard featured week={latestWeek} />
                </div>
              )}

              {/* Restore this section once there are previous launch weeks.
              <section className="mt-8" aria-labelledby="previous-weeks-title">
                <h2
                  className="mb-4 text-xl font-semibold tracking-tight"
                  id="previous-weeks-title"
                >
                  Previous launch weeks
                </h2>

                {previousWeeks.length > 0 ? (
                  <div className="grid gap-4">
                    {previousWeeks.map((week) => (
                      <LaunchWeekCard key={week.slug} week={week} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-surface rounded-xl border p-4">
                    <p className="text-muted-foreground text-sm">
                      No previous launch weeks yet.
                    </p>
                  </div>
                )}
              </section>
              */}
            </article>
          </div>
        </div>
      </DirectionalTransition>
    </>
  );
}
