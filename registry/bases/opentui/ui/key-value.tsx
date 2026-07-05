/* @jsxImportSource @opentui/react */
import { useMemo } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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
    <box flexDirection="column">
      {items.map((item, idx) => {
        const paddedKey = item.key.padEnd(resolvedKeyWidth, " ");
        return (
          <box key={idx} flexDirection="row" gap={1}>
            <text fg={resolvedKeyColor}>{paddedKey}</text>
            <text fg={resolvedKeyColor}>{separator}</text>
            <text fg={item.color ?? resolvedValueColor}>{item.value}</text>
          </box>
        );
      })}
    </box>
  );
};
