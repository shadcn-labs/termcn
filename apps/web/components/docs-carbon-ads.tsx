"use client";

import type { CarbonAdsProps } from "@/components/carbon-ads";
import { CarbonAds } from "@/components/carbon-ads";
import { useIsMobile } from "@/hooks/use-mobile";

const SCRIPT_SERVE = "CWBIT5QM";
const SCRIPT_PLACEMENT = "termcndev";

interface DocsCarbonAdsProps extends CarbonAdsProps {
  hideOn?: "mobile" | "desktop";
}

export const DocsCarbonAds = ({ hideOn, ...props }: DocsCarbonAdsProps) => {
  const isMobile = useIsMobile();

  if (
    (hideOn === "mobile" && isMobile) ||
    (hideOn === "desktop" && !isMobile)
  ) {
    return null;
  }

  return (
    <CarbonAds serve={SCRIPT_SERVE} placement={SCRIPT_PLACEMENT} {...props} />
  );
};
