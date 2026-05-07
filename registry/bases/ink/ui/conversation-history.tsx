import { Box, Text } from "ink";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/theme-provider";
import { useInput } from "@/hooks/use-input";

export interface ConversationHistoryProps {
  maxHeight?: number;
  children?: ReactNode;
  showScrollHint?: boolean;
  isActive?: boolean;
}

export function ConversationHistory({
  maxHeight = 20,
  children,
  showScrollHint = true,
  isActive = true,
}: ConversationHistoryProps) {
  const theme = useTheme();
  const childArray = React.Children.toArray(children);
  const totalChildren = childArray.length;

  const maxOffset = Math.max(0, totalChildren - maxHeight);
  const [scrollOffset, setScrollOffset] = useState(maxOffset);

  useInput(
    (_input, key) => {
      if (key.upArrow) {
        setScrollOffset((o) => Math.max(0, o - 1));
      } else if (key.downArrow) {
        setScrollOffset((o) =>
          Math.min(Math.max(0, totalChildren - maxHeight), o + 1)
        );
      }
    },
    { isActive }
  );

  const visibleChildren = childArray.slice(
    scrollOffset,
    scrollOffset + maxHeight
  );

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" overflow="hidden" height={maxHeight}>
        {visibleChildren}
      </Box>
      {showScrollHint && isActive && (
        <Text dimColor color={theme.colors.mutedForeground}>
          ↑↓ scroll
        </Text>
      )}
    </Box>
  );
}
