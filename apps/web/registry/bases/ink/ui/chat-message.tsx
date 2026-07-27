import { Box, Text } from "ink";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useAnimation } from "@/hooks/use-animation";
import { isActivationKey, useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";

export type ChatRole = "user" | "assistant" | "system" | "error";

export interface ChatMessageProps extends InteractionProps {
  sender: ChatRole;
  name?: string;
  timestamp?: Date;
  streaming?: boolean;
  collapsed?: boolean;
  children?: ReactNode;
  "aria-label"?: string;
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
  id,
  autoFocus,
  isActive = true,
  disabled,
  "aria-label": ariaLabel,
}: ChatMessageProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const dotFrame = useAnimation({
    intervalMs: 400,
    isActive: isActive && streaming,
  });

  const { isFocused } = useInteraction(
    (input, key) => {
      if (initialCollapsed && isActivationKey(input, key)) {
        setIsCollapsed((c) => !c);
      }
    },
    { autoFocus, disabled, id, isActive: isActive && initialCollapsed }
  );

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

  const dot = unicode ? "●" : ".";
  const dots = dot.repeat(dotFrame);

  const childrenText = typeof children === "string" ? children : "";
  const firstLine = childrenText.split("\n")[0] ?? "";

  const renderContent = () => {
    if (streaming) {
      return (
        <Box>
          {children ? (
            wrapPlainChildren(children)
          ) : (
            <Text aria-hidden color={color} dimColor>
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
    <Box
      flexDirection="column"
      marginBottom={1}
      aria-role="listitem"
      aria-state={{
        busy: streaming,
        disabled: disabled || undefined,
        expanded: initialCollapsed ? !isCollapsed : undefined,
      }}
    >
      <Text
        aria-label={
          ariaLabel ??
          `${sender === "error" ? "Error" : "Message"} from ${name ?? roleLabel[sender]}${streaming ? ", streaming" : ""}`
        }
      >
        {""}
      </Text>
      <Box gap={1}>
        {isFocused && initialCollapsed && <Text aria-hidden>[</Text>}
        <Text color={color} bold>
          {name ?? roleLabel[sender]}
        </Text>
        {timestamp && (
          <Text dimColor color={theme.colors.mutedForeground}>
            {formatTime(timestamp)}
          </Text>
        )}
        {isCollapsed && !streaming && (
          <Text aria-hidden dimColor color={theme.colors.mutedForeground}>
            [expand]
          </Text>
        )}
        {isFocused && initialCollapsed && <Text aria-hidden>]</Text>}
      </Box>

      {renderContent()}
    </Box>
  );
};
