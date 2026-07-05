import { Box, Text } from "ink";
import React, { useMemo } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";

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
}

export const KeyValue = ({
  items,
  keyWidth,
  separator = ":",
  keyColor,
  valueColor,
}: KeyValueProps) => {
  const theme = useTheme();

  const resolvedKeyWidth = useMemo(() => {
    if (keyWidth !== undefined) {
      return keyWidth;
    }
    let max = 0;
    for (const item of items) {
      max = Math.max(max, item.key.length);
    }
    return max + 1;
  }, [items, keyWidth]);

  const resolvedKeyColor = keyColor ?? theme.colors.mutedForeground;
  const resolvedValueColor = valueColor ?? theme.colors.foreground;

  return (
    <Box flexDirection="column">
      {items.map((item, idx) => {
        const paddedKey = item.key.padEnd(resolvedKeyWidth, " ");
        return (
          <Box key={idx} flexDirection="row" gap={1}>
            <Text color={resolvedKeyColor}>{paddedKey}</Text>
            <Text color={resolvedKeyColor}>{separator}</Text>
            <Text color={item.color ?? resolvedValueColor}>{item.value}</Text>
          </Box>
        );
      })}
    </Box>
  );
};
