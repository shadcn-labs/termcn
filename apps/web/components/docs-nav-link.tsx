"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIconAnimation } from "@/hooks/use-icon-animation";
import { cn } from "@/lib/utils";

import type { ArrowLeftIconHandle } from "./animated-icons/arrow-left";
import { ArrowLeftIcon } from "./animated-icons/arrow-left";
import type { ArrowRightIconHandle } from "./animated-icons/arrow-right";
import { ArrowRightIcon } from "./animated-icons/arrow-right";

export const DocsNavLink = ({
  href,
  children,
  className,
  tooltip,
  transitionTypes,
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button> & {
  href: string;
  children: React.ReactNode;
  className?: string;
  tooltip?: { title: string; icon: React.ReactNode };
  transitionTypes?: string[];
}) => {
  const { iconRef, onMouseEnter, onMouseLeave } = useIconAnimation<
    ArrowLeftIconHandle | ArrowRightIconHandle
  >();

  const link = (
    <Button
      variant="secondary"
      size={size}
      className={cn("shadow-none", className)}
      asChild
      sound="click"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      <Link href={href} transitionTypes={transitionTypes}>
        {transitionTypes?.includes("nav-back") && (
          <ArrowLeftIcon ref={iconRef} />
        )}
        {children}
        {transitionTypes?.includes("nav-forward") && (
          <ArrowRightIcon ref={iconRef} />
        )}
      </Link>
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent className="pr-2 pl-3">
          <div className="flex items-center gap-3">
            {tooltip.title}
            {tooltip.icon && <Kbd>{tooltip.icon}</Kbd>}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
};
