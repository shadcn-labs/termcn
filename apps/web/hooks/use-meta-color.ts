import { useTheme } from "next-themes";
import { useCallback, useMemo } from "react";

import { META_THEME_COLORS } from "@/constants/site";

export const useMetaColor = () => {
  const { resolvedTheme } = useTheme();

  const metaColor = useMemo(
    () =>
      resolvedTheme === "dark"
        ? META_THEME_COLORS.dark
        : META_THEME_COLORS.light,
    [resolvedTheme]
  );

  const setMetaColor = useCallback((color: string) => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", color);
  }, []);

  return {
    metaColor,
    setMetaColor,
  };
};
