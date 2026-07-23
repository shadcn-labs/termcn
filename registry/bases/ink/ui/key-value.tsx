import { Box, Text } from "ink";
import React, { useMemo } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/hooks/use-theme";
import {
  padToTerminalWidth,
  terminalWidth,
} from "@/registry/bases/ink/lib/terminal-text";

export interface KeyValueItem {
  key: string;
  value: ReactNode;
  color?: string;
}

export interface KeyValueProps {
  items: KeyValueItem[];
  keyWidth?: number;
  separator?: string;
  keyColor?: string;
  valueColor?: string;
  "aria-label"?: string;
}

export const KeyValue = ({
  items,
  keyWidth,
  separator = ":",
  keyColor,
  valueColor,
  "aria-label": ariaLabel = "Key value list",
}: KeyValueProps) => {
  const theme = useTheme();

  const resolvedKeyWidth = useMemo(() => {
    if (keyWidth !== undefined) {
      return keyWidth;
    }
    let max = 0;
    for (const item of items) {
      max = Math.max(max, terminalWidth(item.key));
    }
    return max + 1;
  }, [items, keyWidth]);

  const resolvedKeyColor = keyColor ?? theme.colors.mutedForeground;
  const resolvedValueColor = valueColor ?? theme.colors.foreground;

  return (
    <Box flexDirection="column" aria-role="list">
      <Text aria-label={ariaLabel}>{""}</Text>
      {items.map((item, idx) => {
        const paddedKey = padToTerminalWidth(item.key, resolvedKeyWidth);
        return (
          <Box
            key={idx}
            flexDirection="row"
            gap={1}
            aria-role="listitem"
            aria-label={
              typeof item.value === "string" || typeof item.value === "number"
                ? `${item.key}: ${item.value}`
                : item.key
            }
          >
            <Text color={resolvedKeyColor}>{paddedKey}</Text>
            <Text color={resolvedKeyColor}>{separator}</Text>
            <Text color={item.color ?? resolvedValueColor}>{item.value}</Text>
          </Box>
        );
      })}
    </Box>
  );
};
