"use client";

import type { TuiWebProps } from "@termcn/tui-web";
import { inkComponent, openTuiComponent } from "@termcn/tui-web/descriptors";
import { createDynamicTerminal } from "@termcn/tui-web/next";
import { useEffect } from "react";

import { ExamplePreview } from "@/components/example-preview";
import { ThemeProvider as InkThemeProvider } from "@/components/ui/ink-theme-provider";
import { ThemeProvider as OpenTuiThemeProvider } from "@/components/ui/opentui-theme-provider";
import { useTerminalTheme } from "@/hooks/use-terminal-theme";
import {
  opentuiTerminalThemeMap,
  terminalThemeMap,
} from "@/lib/terminal-themes";
import { DEFAULT_BASE_NAME } from "@/registry/bases";
import type { BaseName } from "@/registry/bases";

const DynamicTuiWeb = createDynamicTerminal<TuiWebProps>(
  async () => {
    const tuiWeb = await import("@termcn/tui-web");
    return tuiWeb.TuiWeb;
  },
  {
    loading: "spinner",
  }
);

export interface TerminalPreviewProps {
  base: BaseName;
  name: string;
  rows?: number;
  theme?: keyof typeof terminalThemeMap;
}

export const TerminalPreview = ({
  base,
  name,
  rows,
  theme,
}: TerminalPreviewProps) => {
  const [terminalThemeKey, setTerminalThemeKey] = useTerminalTheme();

  useEffect(() => {
    if (theme !== undefined) {
      setTerminalThemeKey(theme);
    }
  }, [setTerminalThemeKey, theme]);

  if (base !== DEFAULT_BASE_NAME) {
    const baseTheme = opentuiTerminalThemeMap[terminalThemeKey];
    return (
      <DynamicTuiWeb
        component={openTuiComponent(
          <OpenTuiThemeProvider theme={baseTheme}>
            <ExamplePreview base={base} name={name} />
          </OpenTuiThemeProvider>
        )}
        rows={rows}
        theme={baseTheme}
      />
    );
  }

  const baseTheme = terminalThemeMap[terminalThemeKey];
  return (
    <DynamicTuiWeb
      component={inkComponent(
        <InkThemeProvider theme={baseTheme}>
          <ExamplePreview base={base} name={name} />
        </InkThemeProvider>
      )}
      rows={rows}
      theme={baseTheme}
    />
  );
};
