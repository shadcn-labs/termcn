/* @jsxImportSource @opentui/react */

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface HelpProps {
  keymap: Record<string, string>;
  title?: string;
  compact?: boolean;
}

export const Help = ({ keymap, title, compact = false }: HelpProps) => {
  const theme = useTheme();
  const entries = Object.entries(keymap);

  if (compact) {
    const parts = entries.map(([key, action]) => `${key}: ${action}`);
    return (
      <box gap={1} flexWrap="wrap">
        {title && (
          <text fg={theme.colors.primary}>
            <b>{`${title} |`}</b>
          </text>
        )}
        <text fg={theme.colors.mutedForeground}>{parts.join(" · ")}</text>
      </box>
    );
  }

  const keyWidth = Math.max(...entries.map(([k]) => k.length), 3);

  return (
    <box
      flexDirection="column"
      borderStyle="rounded"
      borderColor={theme.colors.border}
      paddingLeft={1}
      paddingRight={1}
      gap={0}
    >
      {title && (
        <text fg={theme.colors.primary}>
          <b>{title}</b>
        </text>
      )}
      {entries.map(([key, action]) => (
        <box key={key} gap={2}>
          <box
            borderStyle="single"
            borderColor={theme.colors.primary}
            paddingLeft={1}
            paddingRight={1}
            minWidth={keyWidth + 4}
          >
            <text fg={theme.colors.primary}>
              <b>{key}</b>
            </text>
          </box>
          <text fg={theme.colors.foreground}>{action}</text>
        </box>
      ))}
    </box>
  );
};
