"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useFeedback } from "@/hooks/use-feedback";
import { useMetaColor } from "@/hooks/use-meta-color";

export const useThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const { setMetaColor, metaColor } = useMetaColor();
  const feedbackOn = useFeedback({ sound: "toggleOn" });
  const feedbackOff = useFeedback({ sound: "toggleOff" });

  useEffect(() => {
    setMetaColor(metaColor);
  }, [metaColor, setMetaColor]);

  const toggleTheme = useCallback(() => {
    const nextResolved = resolvedTheme === "dark" ? "light" : "dark";
    if (nextResolved === "dark") {
      feedbackOff();
    } else if (nextResolved === "light") {
      feedbackOn();
    } else {
      feedbackOn();
    }
    setTheme(nextResolved);
  }, [resolvedTheme, setTheme, feedbackOn, feedbackOff]);

  useHotkeys("d", () => toggleTheme(), { preventDefault: true });

  return { toggleTheme };
};
