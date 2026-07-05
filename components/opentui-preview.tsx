"use client";

import { TUI } from "@gridland/web";
import { useEffect, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";

import { ThemeProvider } from "@/components/ui/opentui-theme-provider";
import { useTerminalTheme } from "@/hooks/use-terminal-theme";
import { opentuiTerminalThemeMap } from "@/lib/terminal-themes";

const TERMINAL_LINE_HEIGHT = 18;
const TERMINAL_PADDING = 20;

const getTerminalHeight = (rows: number): number =>
  rows * TERMINAL_LINE_HEIGHT + TERMINAL_PADDING;

export interface OpenTuiPreviewProps {
  children: ReactNode;
  theme?: keyof typeof opentuiTerminalThemeMap;
  rows?: number;
  style?: CSSProperties;
}

const OpenTuiPreview = ({
  children,
  theme,
  rows = 18,
  style,
}: OpenTuiPreviewProps) => {
  const [terminalThemeKey, setTerminalThemeKey] = useTerminalTheme();

  useEffect(() => {
    if (theme === undefined) {
      return;
    }
    setTerminalThemeKey(theme);
  }, [theme, setTerminalThemeKey]);

  const baseTheme = useMemo(
    () => opentuiTerminalThemeMap[terminalThemeKey],
    [terminalThemeKey]
  );

  const height = getTerminalHeight(rows);

  return (
    <div
      className="bg-card overflow-hidden"
      style={{ height: `${height}px`, ...style }}
    >
      <TUI
        style={{
          height: "100%",
          width: "100%",
        }}
        backgroundColor={baseTheme.colors.background}
      >
        <ThemeProvider theme={baseTheme}>{children}</ThemeProvider>
      </TUI>
    </div>
  );
};

export default OpenTuiPreview;
