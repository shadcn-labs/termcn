import { ArrowRightIcon } from "lucide-react";
import { useIntlayer } from "next-intlayer";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { getLaunchWeekHref, getLaunchWeeks } from "@/lib/launch-week";

export const Announcement = () => {
  const content = useIntlayer("announcement");
  const [latestWeek] = getLaunchWeeks();

  if (!latestWeek) {
    return null;
  }

  return (
    <Badge asChild variant="secondary">
      <Link
        href={getLaunchWeekHref(latestWeek)}
        transitionTypes={["nav-forward"]}
      >
        <span aria-hidden="true">🎯</span>
        {content.launchWeekIsHere} <ArrowRightIcon />
      </Link>
    </Badge>
  );
};
