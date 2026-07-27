"use client";

import { createDynamicTerminal } from "ink-web/next";

import { ExamplePreview } from "@/components/example-preview";
import type { InkPreviewProps } from "@/components/ink-preview";
import OpenTuiPreview from "@/components/opentui-preview";
import type { terminalThemeMap } from "@/lib/terminal-themes";
import { DEFAULT_BASE_NAME } from "@/registry/bases";
import type { BaseName } from "@/registry/bases";

const InkPreview = createDynamicTerminal<InkPreviewProps>(
  async () => {
    const m = await import("./ink-preview");
    return m.default;
  },
  {
    loading: "spinner",
  }
);

export interface TerminalPreviewProps {
  base: BaseName;
  fontFamily?: string;
  name: string;
  rows?: number;
  theme?: keyof typeof terminalThemeMap;
}

export const TerminalPreview = ({
  base,
  fontFamily,
  name,
  rows,
  theme,
}: TerminalPreviewProps) => {
  if (base !== DEFAULT_BASE_NAME) {
    return (
      <OpenTuiPreview fontFamily={fontFamily} rows={rows} theme={theme}>
        <ExamplePreview base={base} name={name} />
      </OpenTuiPreview>
    );
  }

  return (
    <InkPreview fontFamily={fontFamily} rows={rows} theme={theme}>
      <ExamplePreview base={base} name={name} />
    </InkPreview>
  );
};
