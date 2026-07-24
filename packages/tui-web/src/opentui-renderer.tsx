"use client";

import { TUI } from "@gridland/web";
import { createElement } from "react";

import { ThemeBoundary } from "./theme-boundary.js";
import type {
  OpenTuiComponentDescriptor,
  TuiThemeProvider,
  TuiWebTheme,
} from "./types.js";

const TERMINAL_LINE_HEIGHT = 18;
const TERMINAL_PADDING = 20;

interface OpenTuiWebRendererProps<TTheme extends TuiWebTheme> {
  className?: string;
  component: OpenTuiComponentDescriptor;
  rows: number;
  style?: React.CSSProperties;
  theme: TTheme;
  themeProvider?: TuiThemeProvider<TTheme>;
}

export const OpenTuiWebRenderer = <TTheme extends TuiWebTheme>({
  className,
  component,
  rows,
  style,
  theme,
  themeProvider,
}: OpenTuiWebRendererProps<TTheme>) => {
  const height = rows * TERMINAL_LINE_HEIGHT + TERMINAL_PADDING;
  const content = (
    <ThemeBoundary provider={themeProvider} theme={theme}>
      {component.node}
    </ThemeBoundary>
  );

  return (
    <div
      className={["tui-web", "tui-web--opentui", className]
        .filter(Boolean)
        .join(" ")}
      data-tui-runtime="opentui"
      style={{
        background: theme.colors.background,
        height: `${height}px`,
        overflow: "auto",
        overscrollBehavior: "contain",
        ...style,
      }}
    >
      <TUI
        backgroundColor={theme.colors.background}
        fallbackRows={rows}
        style={{
          height: "100%",
          padding: 10,
          width: "100%",
        }}
      >
        {createElement(
          "scrollbox",
          { flexGrow: 1, scrollX: true, scrollY: true },
          content
        )}
      </TUI>
    </div>
  );
};
