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

let host: HTMLDivElement | null = null;
let blocked = false;
let onBlocked: (() => void) | null = null;
let lastPathname: string | null = null;

const getHost = (src: string) => {
  if (host) {
    return host;
  }

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = src;
  script.addEventListener("error", () => {
    blocked = true;
    onBlocked?.();
  });

  host = document.createElement("div");
  host.dataset.slot = "carbon-ads-host";
  host.append(script);

  return host;
};

export interface CarbonAdsProps {
  serve?: string;
  placement?: string;
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
  const [isBlocked, setIsBlocked] = useState(blocked);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    onBlocked = () => setIsBlocked(true);

    const element = getHost(
      `//cdn.carbonads.com/carbon.js?serve=${serve}&placement=${placement}&format=${format}`
    );
    if (element.parentElement !== container) {
      container.append(element);
    }

    return () => {
      onBlocked = null;
    };
  }, [serve, placement, format]);

  useEffect(() => {
    if (lastPathname !== null && lastPathname !== pathname) {
      window._carbonads?.refresh();
    }
    lastPathname = pathname;
  }, [pathname]);

  if (isBlocked) {
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
