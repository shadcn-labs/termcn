/* @jsxImportSource @opentui/react */
import type { ReactNode } from "react";

export interface ChatThreadProps {
  maxHeight?: number;
  autoScroll?: boolean;
  children?: ReactNode;
}

export const ChatThread = ({
  maxHeight,
  autoScroll = true,
  children,
}: ChatThreadProps) => {
  void autoScroll;

  const containerProps = maxHeight
    ? { height: maxHeight, overflow: "hidden" as const }
    : {};

  return (
    <box flexDirection="column" {...containerProps}>
      {children}
    </box>
  );
};
