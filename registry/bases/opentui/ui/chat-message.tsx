/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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
    <text>{node}</text>
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

  useKeyboard((key) => {
    if (initialCollapsed && (key.name === "return" || key.name === " ")) {
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
        <box>
          {children ? (
            wrapPlainChildren(children)
          ) : (
            <text fg={color}>{dots}</text>
          )}
        </box>
      );
    }
    if (isCollapsed) {
      return (
        <box>
          <text fg="#666">{`${firstLine.slice(0, 60)}${firstLine.length > 60 || childrenText.includes("\n") ? "..." : ""}`}</text>
        </box>
      );
    }
    return <box>{wrapPlainChildren(children)}</box>;
  };

  return (
    <box flexDirection="column" marginBottom={1}>
      <box gap={1}>
        <text fg={color}>
          <b>{name ?? roleLabel[sender]}</b>
        </text>
        {timestamp && (
          <text fg={theme.colors.mutedForeground}>{formatTime(timestamp)}</text>
        )}
        {isCollapsed && !streaming && <text fg="#666">[expand]</text>}
      </box>

      {renderContent()}
    </box>
  );
};
