"use client";

import type { CarbonAdsProps } from "@/components/carbon-ads";
import { CarbonAds } from "@/components/carbon-ads";
import { useMediaQuery } from "@/hooks/use-media-query";

const AD_SERVE = "CWBIT5QM";
const AD_PLACEMENT = "termcndev";
const SIDEBAR_QUERY = "(min-width: 1280px)";

interface DocsAdsProps extends Omit<CarbonAdsProps, "placement" | "serve"> {
  slot: "content" | "sidebar";
}

export const DocsAds = ({ slot, ...props }: DocsAdsProps) => {
  const hasSidebar = useMediaQuery(SIDEBAR_QUERY);

  if (hasSidebar === undefined || hasSidebar !== (slot === "sidebar")) {
    return null;
  }

  return <CarbonAds serve={AD_SERVE} placement={AD_PLACEMENT} {...props} />;
};
