import { Box, Text } from "ink";
import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

export type ChatRole = "user" | "assistant" | "system" | "error";

export interface ChatMessageProps {
  sender: ChatRole;
  name?: string;
  timestamp?: Date;
  streaming?: boolean;
  collapsed?: boolean;
  children?: ReactNode;
}

const formatTime = (date: Date): string =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const wrapPlainChildren = (node: ReactNode): ReactNode =>
  typeof node === "string" || typeof node === "number" ? (
    <Text>{node}</Text>
  ) : (
    node
  );

export const ChatMessage = ({
  sender,
  name,
  timestamp,
  streaming = false,
  collapsed: initialCollapsed = false,
  children,
}: ChatMessageProps) => {
  const theme = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [dotFrame, setDotFrame] = useState(0);

  useEffect(() => {
    if (!streaming) {
      return;
    }
    const id = setInterval(() => setDotFrame((f) => (f + 1) % 4), 400);
    return () => clearInterval(id);
  }, [streaming]);

  useInput((input, key) => {
    if (initialCollapsed && (key.return || input === " ")) {
      setIsCollapsed((c) => !c);
    }
  });

  const roleColor: Record<ChatRole, string> = {
    assistant: theme.colors.success ?? "green",
    error: theme.colors.error ?? "red",
    system: theme.colors.mutedForeground,
    user: theme.colors.primary,
  };

  const roleLabel: Record<ChatRole, string> = {
    assistant: "assistant",
    error: "error",
    system: "system",
    user: "user",
  };

  const color = roleColor[sender];

  const dots = ["", "●", "●●", "●●●"][dotFrame] ?? "";

  const childrenText = typeof children === "string" ? children : "";
  const firstLine = childrenText.split("\n")[0] ?? "";

  const renderContent = () => {
    if (streaming) {
      return (
        <Box>
          {children ? (
            wrapPlainChildren(children)
          ) : (
            <Text color={color} dimColor>
              {dots}
            </Text>
          )}
        </Box>
      );
    }
    if (isCollapsed) {
      return (
        <Box>
          <Text dimColor>
            {firstLine.slice(0, 60)}
            {firstLine.length > 60 || childrenText.includes("\n") ? "..." : ""}
          </Text>
        </Box>
      );
    }
    return <Box>{wrapPlainChildren(children)}</Box>;
  };

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box gap={1}>
        <Text color={color} bold>
          {name ?? roleLabel[sender]}
        </Text>
        {timestamp && (
          <Text dimColor color={theme.colors.mutedForeground}>
            {formatTime(timestamp)}
          </Text>
        )}
        {isCollapsed && !streaming && (
          <Text dimColor color={theme.colors.mutedForeground}>
            [expand]
          </Text>
        )}
      </Box>

      {renderContent()}
    </Box>
  );
};
