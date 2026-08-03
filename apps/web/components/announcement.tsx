import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { getLaunchWeekHref, getLaunchWeeks } from "@/lib/launch-week";

export const Announcement = () => {
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
        Launch week is here <ArrowRightIcon />
      </Link>
    </Badge>
  );
};
