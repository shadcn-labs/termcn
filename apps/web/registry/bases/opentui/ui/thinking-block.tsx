/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface ThinkingBlockProps {
  content: string;
  streaming?: boolean;
  defaultCollapsed?: boolean;
  label?: string;
  tokenCount?: number;
  duration?: number;
}

export const ThinkingBlock = ({
  content,
  streaming = false,
  defaultCollapsed = true,
  label = "Reasoning",
  tokenCount,
  duration,
}: ThinkingBlockProps) => {
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  useKeyboard((key) => {
    if (key.name === "return" || key.name === " ") {
      setCollapsed((c) => !c);
    }
  });

  const tokenStr =
    tokenCount === undefined ? null : `${tokenCount.toLocaleString()} tokens`;
  const durationStr =
    duration === undefined ? null : `${(duration / 1000).toFixed(1)}s`;

  const headerParts = [
    streaming ? "Thinking..." : label,
    tokenStr,
    durationStr,
  ].filter(Boolean);

  const headerText = headerParts.join(" · ");

  return (
    <box
      flexDirection="column"
      borderStyle="single"
      borderColor={theme.colors.border}
      paddingLeft={1}
      paddingRight={1}
    >
      <box gap={1}>
        <text fg={theme.colors.mutedForeground}>{collapsed ? "▶" : "▼"}</text>
        <text
          fg={streaming ? theme.colors.primary : theme.colors.mutedForeground}
        >
          {headerText}
        </text>
      </box>

      {!collapsed && (
        <box flexDirection="column" paddingTop={1}>
          <text fg={theme.colors.mutedForeground}>{content}</text>
        </box>
      )}
    </box>
  );
};
