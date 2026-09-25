import { getIntlayer } from "intlayer";
import { ArrowRightIcon, CheckIcon, CircleDashedIcon } from "lucide-react";
import type { Metadata } from "next";
import { useIntlayer } from "next-intlayer/server";
import type { ReactNode } from "react";

import { DirectionalTransition } from "@/components/directional-transition";
import { Link } from "@/components/link";
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
import { localizeHref } from "@/lib/url";
import { BreadcrumbJsonLd } from "@/seo/json-ld";
import { createPageMetadata } from "@/seo/metadata";

export const dynamic = "force-static";
export const revalidate = false;

interface LaunchWeekCardLabels {
  active: ReactNode;
  complete: ReactNode;
  latest: ReactNode;
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const content = getIntlayer("launch-weeks-page", locale);

  return createPageMetadata({
    description: content.metadataDescription,
    noIndex: true,
    path: ROUTES.LAUNCH_WEEK,
    title: content.metadataTitle,
  });
};

const LaunchWeekCard = ({
  featured = false,
  labels,
  week,
}: {
  featured?: boolean;
  labels: LaunchWeekCardLabels;
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
                {week.status === "active" ? labels.active : labels.complete}
              </Badge>
              {featured && <span className="sr-only">{labels.latest}</span>}
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

export default async function LaunchWeeksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = useIntlayer("launch-weeks-page", locale);
  const [latestWeek] = getLaunchWeeks();

  const labels: LaunchWeekCardLabels = {
    active: content.statusActive,
    complete: content.statusComplete,
    latest: content.latestLabel,
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          {
            name: content.breadcrumbHome.value,
            path: localizeHref(ROUTES.HOME, locale),
          },
          {
            name: content.breadcrumbLaunchWeeks.value,
            path: localizeHref(ROUTES.LAUNCH_WEEK, locale),
          },
        ]}
      />
      <DirectionalTransition>
        <div className="container-wrapper">
          <div className="container py-16 md:py-20 lg:py-24">
            <article className="mx-auto w-full max-w-2xl">
              <PageHero
                description={content.heroDescription}
                title={content.heroTitle}
              />

              {latestWeek && (
                <div className="mt-8">
                  <LaunchWeekCard featured labels={labels} week={latestWeek} />
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
                      <LaunchWeekCard
                        key={week.slug}
                        labels={labels}
                        week={week}
                      />
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
