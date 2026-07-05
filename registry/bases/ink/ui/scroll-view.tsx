import { Box, Text } from "ink";
import React, { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

export interface ScrollViewProps {
  height: number;
  children: ReactNode;
  contentHeight?: number;
  showScrollbar?: boolean;
  scrollbarColor?: string;
  thumbColor?: string;
  trackChar?: string;
  thumbChar?: string;
}

export const ScrollView = ({
  height,
  children,
  contentHeight = 0,
  showScrollbar = true,
  scrollbarColor,
  thumbColor,
  trackChar = "│",
  thumbChar = "█",
}: ScrollViewProps) => {
  const theme = useTheme();
  const [scrollTop, setScrollTop] = useState(0);

  const resolvedTrackColor = scrollbarColor ?? theme.colors.mutedForeground;
  const resolvedThumbColor = thumbColor ?? theme.colors.primary;

  const maxScroll = Math.max(0, contentHeight - height);

  const clampedScroll = Math.min(scrollTop, maxScroll);

  useInput((_input, key) => {
    if (key.upArrow) {
      setScrollTop((s) => Math.max(0, s - 1));
    } else if (key.downArrow) {
      setScrollTop((s) => Math.min(maxScroll > 0 ? maxScroll : s + 1, s + 1));
    } else if (key.pageUp) {
      setScrollTop((s) => Math.max(0, s - height));
    } else if (key.pageDown) {
      setScrollTop((s) =>
        maxScroll > 0 ? Math.min(maxScroll, s + height) : s + height
      );
    } else if (key.home) {
      setScrollTop(0);
    } else if (key.end && maxScroll > 0) {
      setScrollTop(maxScroll);
    }
  });

  const thumbSize = useMemo(() => {
    if (contentHeight <= height) {
      return height;
    }
    return Math.max(1, Math.round((height / contentHeight) * height));
  }, [contentHeight, height]);

  const thumbPosition = useMemo(() => {
    if (contentHeight <= height || maxScroll === 0) {
      return 0;
    }
    return Math.round((clampedScroll / maxScroll) * (height - thumbSize));
  }, [clampedScroll, maxScroll, height, thumbSize, contentHeight]);

  const scrollbar = useMemo(
    () =>
      Array.from({ length: height }, (_, i) => {
        const isThumb = i >= thumbPosition && i < thumbPosition + thumbSize;
        return { char: isThumb ? thumbChar : trackChar, isThumb };
      }),
    [height, thumbPosition, thumbSize, thumbChar, trackChar]
  );

  return (
    <Box flexDirection="row" height={height} overflow="hidden">
      <Box
        flexGrow={1}
        flexDirection="column"
        marginTop={-clampedScroll as number}
      >
        {children}
      </Box>
      {showScrollbar && (
        <Box width={1} flexDirection="column">
          {scrollbar.map((seg, i) => (
            <Text
              key={i}
              color={seg.isThumb ? resolvedThumbColor : resolvedTrackColor}
            >
              {seg.char}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};
