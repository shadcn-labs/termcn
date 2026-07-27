"use client";

import { GithubIcon } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LINK } from "@/constants/links";
import { UTM_PARAMS } from "@/constants/site";
import { useFeedback } from "@/hooks/use-feedback";
import { addQueryParams } from "@/lib/url";
import { cn } from "@/lib/utils";

export const GitHubStars = ({
  stargazersCount,
}: {
  stargazersCount: number;
}) => {
  const play = useFeedback({ sound: "star" });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={addQueryParams(LINK.GITHUB, UTM_PARAMS)}
          target="_blank"
          rel="noopener"
          onClick={play}
          className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
        >
          <GithubIcon className="-translate-y-px" />
          <span className="text-xs text-muted-foreground tabular-nums">
            {new Intl.NumberFormat("en-US", {
              compactDisplay: "short",
              notation: "compact",
            })
              .format(stargazersCount)
              .toLowerCase()}
          </span>
        </a>
      </TooltipTrigger>
      <TooltipContent>
        {new Intl.NumberFormat("en-US").format(stargazersCount)} stars
      </TooltipContent>
    </Tooltip>
  );
};
