import { ComponentSource } from "@/components/component-source";
import { MacWindow } from "@/components/mac-window";
import type { TerminalPreviewProps } from "@/components/terminal-preview";
import { TerminalPreview } from "@/components/terminal-preview";
import { TerminalTheme } from "@/components/terminal-theme";
import { cn } from "@/lib/utils";
import { DEFAULT_BASE_NAME } from "@/registry/bases";

export const ComponentPreview = ({
  base = DEFAULT_BASE_NAME,
  name,
  title = "Terminal",
  className,
  hideCode = false,
  theme,
}: Omit<TerminalPreviewProps, "base"> & {
  base?: TerminalPreviewProps["base"];
  title?: string;
  className?: string;
  hideCode?: boolean;
}) => (
  <>
    <MacWindow
      className={cn("mt-4", className)}
      title={title}
      trailing={<TerminalTheme />}
    >
      <TerminalPreview base={base} name={name} theme={theme} />
    </MacWindow>
    {!hideCode && <ComponentSource base={base} name={name} />}
  </>
);
