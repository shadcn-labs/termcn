import { Box, Text } from "ink";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";

export interface ConversationHistoryProps extends InteractionProps {
  maxHeight?: number;
  children?: ReactNode;
  showScrollHint?: boolean;
  "aria-label"?: string;
}

export function ConversationHistory({
  maxHeight = 20,
  children,
  showScrollHint = true,
  isActive = true,
  id,
  autoFocus,
  disabled,
  "aria-label": ariaLabel = "Conversation history",
}: ConversationHistoryProps) {
  const theme = useTheme();
  const unicode = useUnicode();
  const childArray = React.Children.toArray(children);
  const totalChildren = childArray.length;

  const maxOffset = Math.max(0, totalChildren - maxHeight);
  const [scrollOffset, setScrollOffset] = useState(maxOffset);

  const { isFocused } = useInteraction(
    (_input, key) => {
      if (key.upArrow) {
        setScrollOffset((o) => Math.max(0, o - 1));
      } else if (key.downArrow) {
        setScrollOffset((o) =>
          Math.min(Math.max(0, totalChildren - maxHeight), o + 1)
        );
      } else if (key.home) {
        setScrollOffset(0);
      } else if (key.end) {
        setScrollOffset(maxOffset);
      } else if (key.pageUp) {
        setScrollOffset((offset) => Math.max(0, offset - maxHeight));
      } else if (key.pageDown) {
        setScrollOffset((offset) => Math.min(maxOffset, offset + maxHeight));
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const visibleChildren = childArray.slice(
    scrollOffset,
    scrollOffset + maxHeight
  );

  return (
    <Box
      flexDirection="column"
      aria-role="list"
      aria-state={{ disabled: disabled || undefined }}
    >
      <Text
        aria-label={`${ariaLabel}. Showing items ${totalChildren === 0 ? 0 : scrollOffset + 1} through ${Math.min(totalChildren, scrollOffset + maxHeight)} of ${totalChildren}.${isFocused ? " Focused." : ""}`}
      >
        {""}
      </Text>
      <Box flexDirection="column" overflow="hidden" height={maxHeight}>
        {visibleChildren}
      </Box>
      {showScrollHint && isActive && (
        <Text aria-hidden dimColor color={theme.colors.mutedForeground}>
          {unicode ? "↑↓ scroll" : "up/down scroll"}
        </Text>
      )}
    </Box>
  );
}
