import { Box, Text } from "ink";
import React, { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";

export interface VirtualListProps<T> extends InteractionProps {
  items: T[];
  renderItem: (item: T, index: number, isActive: boolean) => ReactNode;
  height: number;
  onSelect?: (item: T, index: number) => void;
  cursor?: string;
  overscan?: number;
  getItemKey?: (item: T, index: number) => React.Key;
  getItemLabel?: (item: T, index: number) => string;
  "aria-label"?: string;
}

export const VirtualList = <T,>({
  items,
  renderItem,
  height,
  onSelect,
  overscan = 2,
  getItemKey,
  getItemLabel = String,
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel = "Virtual list",
}: VirtualListProps<T>) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const thumbCharacter = unicode ? "█" : "#";
  const trackCharacter = unicode ? "│" : "|";
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowStart, setWindowStart] = useState(0);

  const { isFocused } = useInteraction(
    (_input, key) => {
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
      } else if (key.home) {
        setActiveIndex(0);
        setWindowStart(0);
      } else if (key.end) {
        const last = Math.max(0, items.length - 1);
        setActiveIndex(last);
        setWindowStart(Math.max(0, last - height + 1));
      } else if (key.return) {
        const item = items[activeIndex];
        if (item !== undefined) {
          onSelect?.(item, activeIndex);
        }
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  useEffect(() => {
    const last = Math.max(0, items.length - 1);
    setActiveIndex((index) => Math.min(index, last));
    setWindowStart((start) => Math.min(start, Math.max(0, last - height + 1)));
  }, [height, items.length]);

  const visibleStart = Math.max(0, windowStart - overscan);
  const visibleEnd = Math.min(items.length, windowStart + height + overscan);
  const visibleItems = useMemo(
    () => items.slice(visibleStart, visibleEnd),
    [items, visibleStart, visibleEnd]
  );

  const thumbSize = Math.max(
    1,
    Math.floor((height * height) / Math.max(1, items.length))
  );
  const thumbPosition =
    items.length <= height
      ? 0
      : Math.floor((activeIndex / (items.length - 1)) * (height - thumbSize));

  const scrollbar = useMemo(
    () =>
      Array.from({ length: height }, (_, i) => {
        if (i >= thumbPosition && i < thumbPosition + thumbSize) {
          return thumbCharacter;
        }
        return trackCharacter;
      }),
    [height, thumbCharacter, thumbPosition, thumbSize, trackCharacter]
  );

  return (
    <Box
      flexDirection="row"
      aria-role="listbox"
      aria-state={{ disabled: disabled || undefined }}
    >
      <Text aria-label={`${ariaLabel}. ${items.length} items.`}>{""}</Text>
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
            <Box
              key={getItemKey?.(item, globalIdx) ?? globalIdx}
              aria-role="option"
              aria-label={getItemLabel(item, globalIdx)}
              aria-state={{ selected: isActive && isFocused }}
            >
              {renderItem(item, globalIdx, isActive && isFocused)}
            </Box>
          );
        })}
      </Box>
      {items.length > height && (
        <Box aria-hidden flexDirection="column" marginLeft={1}>
          {scrollbar.map((char, i) => (
            <Text
              key={i}
              color={
                char === thumbCharacter
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
