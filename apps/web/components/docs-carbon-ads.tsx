"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    _carbonads: {
      refresh: () => void;
    };
  }
}

export const CarbonAds = () => {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (window._carbonads) {
      window._carbonads.refresh();
    } else {
      const script = document.createElement("script");
      script.src =
        "//cdn.carbonads.com/carbon.js?serve=CWBIT5QM&placement=termcndev&format=responsive";
      script.id = "_carbonads_js";
      script.async = true;
      container.append(script);
    }
  }, [pathname]);

  return (
    <div
      className="w-full overflow-hidden min-h-38.75 relative"
      id="carbon-container"
      ref={containerRef}
    />
  );
};
