import { notFound } from "next/navigation";

import { DirectionalTransition } from "@/components/directional-transition";
import { LaunchWeek } from "@/components/launch-week";
import { ROUTES } from "@/constants/routes";
import {
  formatLaunchWeekRange,
  getLaunchWeek,
  getLaunchWeekHref,
  getLaunchWeeks,
} from "@/lib/launch-week";
import { BreadcrumbJsonLd } from "@/seo/json-ld";
import { createPageMetadata } from "@/seo/metadata";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

export const generateStaticParams = () =>
  getLaunchWeeks().map((week) => ({ week: week.slug }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ week: string }>;
}) => {
  const { week: slug } = await params;
  const week = getLaunchWeek(slug);

  if (!week) {
    notFound();
  }

  return createPageMetadata({
    description: week.description,
    noIndex: true,
    path: getLaunchWeekHref(week),
    title: `${week.title}: ${formatLaunchWeekRange(week)}`,
  });
};

export default async function LaunchWeekPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week: slug } = await params;
  const week = getLaunchWeek(slug);

  if (!week) {
    notFound();
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: ROUTES.HOME },
          { name: "Launch Weeks", path: ROUTES.LAUNCH_WEEK },
          { name: week.title, path: getLaunchWeekHref(week) },
        ]}
      />
      <DirectionalTransition>
        <LaunchWeek week={week} />
      </DirectionalTransition>
    </>
  );
}
