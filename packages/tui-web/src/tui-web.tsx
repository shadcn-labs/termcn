"use client";

import { InkWebRenderer } from "./ink-renderer.js";
import { OpenTuiWebRenderer } from "./opentui-renderer.js";
import type { TuiWebProps, TuiWebTheme } from "./types.js";

const DEFAULT_ROWS = 18;

export const TuiWeb = <TTheme extends TuiWebTheme>({
  className,
  component,
  onReady,
  rows = DEFAULT_ROWS,
  style,
  theme,
  themeProvider,
}: TuiWebProps<TTheme>) => {
  if (component.runtime === "ink") {
    return (
      <InkWebRenderer
        className={className}
        component={component}
        onReady={onReady}
        rows={rows}
        theme={theme}
        themeProvider={themeProvider}
      />
    );
  }

  return (
    <OpenTuiWebRenderer
      className={className}
      component={component}
      rows={rows}
      style={style}
      theme={theme}
      themeProvider={themeProvider}
    />
  );
};
