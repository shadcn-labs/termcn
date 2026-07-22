/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { createElement, useEffect } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import {
  useNotificationsProvider,
  NotificationsContext,
} from "@/hooks/use-notifications";
import type { NotificationVariant } from "@/hooks/use-notifications";

export interface NotificationCenterProps {
  maxVisible?: number;
  width?: number;
}

const variantIcon = (v: NotificationVariant): string => {
  switch (v) {
    case "success": {
      return "✓";
    }
    case "warning": {
      return "!";
    }
    case "error": {
      return "✗";
    }
    default: {
      return "i";
    }
  }
};

const variantColor = (
  v: NotificationVariant,
  colors: {
    success: string;
    warning: string;
    error: string;
    info: string;
  }
): string => {
  switch (v) {
    case "success": {
      return colors.success;
    }
    case "warning": {
      return colors.warning;
    }
    case "error": {
      return colors.error;
    }
    default: {
      return colors.info;
    }
  }
};

export const NotificationCenter = ({
  maxVisible = 5,
  width = 40,
}: NotificationCenterProps) => {
  const ctx = useNotificationsProvider();
  const theme = useTheme();
  const { notifications, dismiss, clear } = ctx;

  const visible = notifications.slice(-maxVisible);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    for (const n of notifications) {
      if (!n.persistent) {
        const dur = n.duration ?? 5000;
        const elapsed = Date.now() - n.timestamp;
        const remaining = dur - elapsed;
        if (remaining <= 0) {
          dismiss(n.id);
        } else {
          const t = setTimeout(() => dismiss(n.id), remaining);
          return () => clearTimeout(t);
        }
      }
    }
  }, [notifications, dismiss]);

  useKeyboard((key) => {
    if (key.name === "escape") {
      clear();
    }
  });

  if (visible.length === 0) {
    return null;
  }

  return createElement(
    NotificationsContext.Provider,
    { value: ctx },
    <box flexDirection="column">
      <box flexDirection="row" justifyContent="space-between" marginBottom={0}>
        <text fg={theme.colors.primary}>
          <b>{`Notifications ${unread > 0 ? `[${unread} unread]` : ""}`}</b>
        </text>
        <text fg="#666">Esc: clear</text>
      </box>
      {visible.map((n) => {
        const color = variantColor(n.variant, theme.colors);
        const icon = variantIcon(n.variant);
        return (
          <box
            key={n.id}
            flexDirection="column"
            borderStyle="single"
            borderColor={color}
            padding={0}
            paddingLeft={1}
            paddingRight={1}
            marginTop={0}
            width={width}
          >
            <box flexDirection="row" gap={1}>
              <text fg={color}>
                <b>{icon}</b>
              </text>
              <text
                fg={
                  n.read
                    ? theme.colors.mutedForeground
                    : theme.colors.foreground
                }
              >
                <b>{n.title}</b>
              </text>
            </box>
            {n.body && <text fg="#666">{n.body}</text>}
          </box>
        );
      })}
    </box>
  );
};
