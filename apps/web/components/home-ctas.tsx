"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useIconAnimation } from "@/hooks/use-icon-animation";
import { cn } from "@/lib/utils";

import { ArrowRightIcon } from "./animated-icons/arrow-right";
import type { ArrowRightIconHandle } from "./animated-icons/arrow-right";
import { ComponentIcon } from "./animated-icons/component";
import type { ComponentIconHandle } from "./animated-icons/component";

const GetStartedButton = () => {
  const { iconRef, onMouseEnter, onMouseLeave } =
    useIconAnimation<ArrowRightIconHandle>();

  return (
    <Button
      asChild
      sound="click"
      className="px-4"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link href={ROUTES.DOCS_INSTALLATION} transitionTypes={["nav-forward"]}>
        Get Started
        <ArrowRightIcon className="hidden sm:inline" ref={iconRef} />
      </Link>
    </Button>
  );
};

const BrowseComponentsButton = () => {
  const { iconRef, onMouseEnter, onMouseLeave } =
    useIconAnimation<ComponentIconHandle>();

  return (
    <Button
      asChild
      variant="outline"
      sound="click"
      className="px-4"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link href={ROUTES.DOCS_COMPONENTS} transitionTypes={["nav-forward"]}>
        <ComponentIcon className="hidden sm:inline" ref={iconRef} size={22} />
        Browse Components
      </Link>
    </Button>
  );
};

export const HomeCtas = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "flex flex-wrap items-center justify-center gap-4",
      className
    )}
  >
    <GetStartedButton />
    <BrowseComponentsButton />
  </div>
);
