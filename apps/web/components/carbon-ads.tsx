"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

declare global {
  interface Window {
    _carbonads?: {
      refresh: () => void;
    };
  }
}

const SCRIPT_ID = "_carbonads_js";

export interface CarbonAdsProps {
  /** The `serve` query parameter of your Carbon ad tag. */
  serve?: string;
  /** The `placement` query parameter of your Carbon ad tag. */
  placement?: string;
  /**
   * Ad layout. `responsive` adapts to the container width, `cover` is the
   * taller unit. Defaults to "responsive".
   */
  format?: "cover" | "responsive";
  className?: string;
}

export const CarbonAds = ({
  serve = "",
  placement = "",
  format = "responsive",
  className,
}: CarbonAdsProps) => {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // carbon.js inserts the ad after its script tag, so the tag lives here.
    // A loading script runs its own init, so refresh only after it loaded.
    const script = document.querySelector<HTMLElement>(`#${SCRIPT_ID}`);
    if (script) {
      if (container.contains(script) && script.dataset.loaded) {
        window._carbonads?.refresh();
      }
      return;
    }

    const el = document.createElement("script");
    el.id = SCRIPT_ID;
    el.async = true;
    el.type = "text/javascript";
    el.src = `//cdn.carbonads.com/carbon.js?serve=${serve}&placement=${placement}&format=${format}`;
    el.addEventListener("load", () => {
      el.dataset.loaded = "true";
    });
    el.addEventListener("error", () => setBlocked(true));
    container.append(el);
  }, [pathname, serve, placement, format]);

  if (blocked) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      data-slot="carbon-ads"
      data-format={format}
      className={cn("min-h-39 data-[format=cover]:min-h-70", className)}
    />
  );
};
