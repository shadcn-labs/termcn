import { Static, Box, Text } from "ink";
import React from "react";
import type { ReactNode } from "react";

export interface ChatThreadProps {
  maxHeight?: number;
  autoScroll?: boolean;
  children?: ReactNode;
  staticHistory?: boolean;
  "aria-label"?: string;
}

export const ChatThread = ({
  maxHeight,
  autoScroll = true,
  children,
  staticHistory = false,
  "aria-label": ariaLabel = "Chat thread",
}: ChatThreadProps) => {
  void autoScroll;

  const containerProps = maxHeight
    ? { height: maxHeight, overflow: "hidden" as const }
    : {
        /* noop */
      };

  return (
    <Box flexDirection="column" {...containerProps} aria-role="list">
      <Text aria-label={ariaLabel}>{""}</Text>
      {staticHistory ? (
        <Static items={React.Children.toArray(children)}>
          {(item, index) => <Box key={index}>{item}</Box>}
        </Static>
      ) : (
        children
      )}
    </Box>
  );
};
