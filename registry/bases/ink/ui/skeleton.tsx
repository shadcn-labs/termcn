import { Box, Text } from "ink";
import React from "react";

import { useAnimation } from "@/hooks/use-animation";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";

export interface SkeletonProps {
  width?: number;
  height?: number;
  animated?: boolean;
  isActive?: boolean;
  "aria-label"?: string;
}

export const Skeleton = ({
  width = 20,
  height = 1,
  animated = true,
  isActive = true,
  "aria-label": ariaLabel = "Loading",
}: SkeletonProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const highlightChar = unicode ? "█" : "#";
  const baseChar = unicode ? "░" : ".";
  const frame = useAnimation({
    intervalMs: 250,
    isActive: animated && isActive,
  });

  const offset = animated ? frame % (width + 6) : -1;

  const _buildRow = (): string => {
    let row = "";
    for (let i = 0; i < width; i += 1) {
      const inHighlight = i >= offset - 3 && i <= offset + 3;
      row += inHighlight ? highlightChar : baseChar;
    }
    return row;
  };

  const rows = Array.from({ length: height }, (_, rowIndex) => {
    const rowOffset = animated ? (frame + rowIndex * 2) % (width + 6) : -1;
    let row = "";
    for (let i = 0; i < width; i += 1) {
      const inHighlight = i >= rowOffset - 3 && i <= rowOffset + 3;
      row += inHighlight ? highlightChar : baseChar;
    }
    return row;
  });

  return (
    <Box
      flexDirection="column"
      aria-role="progressbar"
      aria-label={ariaLabel}
      aria-state={{ busy: isActive }}
    >
      <Box aria-hidden flexDirection="column">
        {rows.map((row, i) => (
          <Text key={i}>
            {[...row].map((char, j) => (
              <Text
                key={j}
                color={
                  char === highlightChar
                    ? theme.colors.mutedForeground
                    : theme.colors.muted
                }
              >
                {char}
              </Text>
            ))}
          </Text>
        ))}
      </Box>
    </Box>
  );
};
