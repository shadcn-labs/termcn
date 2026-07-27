import { Box, Text } from "ink";
import React, { useState, useMemo } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

export interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, isActive: boolean) => ReactNode;
  height: number;
  onSelect?: (item: T, index: number) => void;
  cursor?: string;
  overscan?: number;
}

export const VirtualList = <T,>({
  items,
  renderItem,
  height,
  onSelect,
  overscan = 2,
}: VirtualListProps<T>) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowStart, setWindowStart] = useState(0);

  useInput((_input, key) => {
    if (key.upArrow) {
      setActiveIndex((prev) => {
        const next = Math.max(0, prev - 1);
        setWindowStart((ws) => Math.min(ws, next));
        return next;
      });
    } else if (key.downArrow) {
      setActiveIndex((prev) => {
        const next = Math.min(items.length - 1, prev + 1);
        setWindowStart((ws) => {
          if (next >= ws + height) {
            return next - height + 1;
          }
          return ws;
        });
        return next;
      });
    } else if (key.return) {
      const item = items[activeIndex];
      if (item !== undefined) {
        onSelect?.(item, activeIndex);
      }
    }
  });

  const visibleStart = Math.max(0, windowStart - overscan);
  const visibleEnd = Math.min(items.length, windowStart + height + overscan);
  const visibleItems = useMemo(
    () => items.slice(visibleStart, visibleEnd),
    [items, visibleStart, visibleEnd]
  );

  const thumbSize = Math.max(1, Math.floor((height * height) / items.length));
  const thumbPosition =
    items.length <= height
      ? 0
      : Math.floor((activeIndex / (items.length - 1)) * (height - thumbSize));

  const scrollbar = useMemo(
    () =>
      Array.from({ length: height }, (_, i) => {
        if (i >= thumbPosition && i < thumbPosition + thumbSize) {
          return "█";
        }
        return "│";
      }),
    [height, thumbPosition, thumbSize]
  );

  return (
    <Box flexDirection="row">
      <Box flexDirection="column" flexGrow={1}>
        {visibleItems.map((item, localIdx) => {
          const globalIdx = visibleStart + localIdx;
          const isVisible =
            globalIdx >= windowStart && globalIdx < windowStart + height;
          if (!isVisible) {
            return null;
          }
          const isActive = globalIdx === activeIndex;
          return (
            <Box key={globalIdx}>{renderItem(item, globalIdx, isActive)}</Box>
          );
        })}
      </Box>
      {items.length > height && (
        <Box flexDirection="column" marginLeft={1}>
          {scrollbar.map((char, i) => (
            <Text
              key={i}
              color={
                char === "█"
                  ? theme.colors.primary
                  : theme.colors.mutedForeground
              }
            >
              {char}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};
