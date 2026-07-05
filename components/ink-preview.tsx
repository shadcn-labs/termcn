"use client";

import "ink-web/css";
import "@xterm/xterm/css/xterm.css";
import { InkTerminalBox } from "ink-web";
import { useEffect, useMemo } from "react";

import { ThemeProvider } from "@/components/ui/ink-theme-provider";
import { useTerminalTheme } from "@/hooks/use-terminal-theme";
import { terminalThemeMap } from "@/lib/terminal-themes";

export interface InkPreviewProps {
  children: React.ReactElement;
  theme?: keyof typeof terminalThemeMap;
  onReady?: () => void;
  rows?: number;
}

const InkPreview = ({
  children,
  theme,
  onReady,
  rows = 18,
}: InkPreviewProps) => {
  const [terminalThemeKey, setTerminalThemeKey] = useTerminalTheme();

  useEffect(() => {
    if (theme === undefined) {
      return;
    }
    setTerminalThemeKey(theme);
  }, [theme, setTerminalThemeKey]);

  const baseTheme = useMemo(
    () => terminalThemeMap[terminalThemeKey],
    [terminalThemeKey]
  );

  const xtermTheme = useMemo(
    () => ({
      background: baseTheme.colors.background,
      cursor: baseTheme.colors.foreground,
      foreground: baseTheme.colors.foreground,
      selectionBackground: baseTheme.colors.selection,
      selectionForeground: baseTheme.colors.selectionForeground,
    }),
    [baseTheme]
  );

  return (
    <div
      className="terminal-preview-root"
      style={
        {
          "--ink-terminal-bg": xtermTheme.background,
        } as React.CSSProperties
      }
    >
      <InkTerminalBox
        loading={false}
        padding={10}
        rows={rows}
        focus={false}
        termOptions={{ theme: xtermTheme }}
        onReady={onReady}
      >
        <ThemeProvider theme={baseTheme}>{children}</ThemeProvider>
      </InkTerminalBox>
    </div>
  );
};

export default InkPreview;
