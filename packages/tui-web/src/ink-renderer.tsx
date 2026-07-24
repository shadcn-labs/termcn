"use client";

import "@xterm/xterm/css/xterm.css";
import "ink-web/css";
import "../styles.css";
import { InkTerminalBox } from "ink-web";

import { ThemeBoundary } from "./theme-boundary.js";
import type {
  InkComponentDescriptor,
  TuiThemeProvider,
  TuiWebTheme,
} from "./types.js";

interface InkWebRendererProps<TTheme extends TuiWebTheme> {
  className?: string;
  component: InkComponentDescriptor;
  onReady?: () => void;
  rows: number;
  theme: TTheme;
  themeProvider?: TuiThemeProvider<TTheme>;
}

export const InkWebRenderer = <TTheme extends TuiWebTheme>({
  className,
  component,
  onReady,
  rows,
  theme,
  themeProvider,
}: InkWebRendererProps<TTheme>) => {
  const xtermTheme = {
    background: theme.colors.background,
    cursor: theme.colors.foreground,
    foreground: theme.colors.foreground,
    selectionBackground: theme.colors.selection,
    selectionForeground: theme.colors.selectionForeground,
  };

  return (
    <div
      className={["tui-web", "tui-web--ink", className]
        .filter(Boolean)
        .join(" ")}
      data-tui-runtime="ink"
      style={
        {
          "--tui-web-background": theme.colors.background,
        } as React.CSSProperties
      }
    >
      <InkTerminalBox
        focus={false}
        loading={false}
        onReady={onReady}
        padding={10}
        rows={rows}
        termOptions={{ theme: xtermTheme }}
      >
        <ThemeBoundary provider={themeProvider} theme={theme}>
          {component.node}
        </ThemeBoundary>
      </InkTerminalBox>
    </div>
  );
};
