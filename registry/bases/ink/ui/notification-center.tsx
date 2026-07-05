import { Box, Text } from "ink";
import React, { useEffect } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";
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
  colors: { success: string; warning: string; error: string; info: string }
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

  useInput((_input, key) => {
    if (key.escape) {
      clear();
    }
  });

  if (visible.length === 0) {
    return null;
  }

  return (
    <NotificationsContext.Provider value={ctx}>
      <Box flexDirection="column" width={width}>
        <Box
          flexDirection="row"
          justifyContent="space-between"
          marginBottom={0}
        >
          <Text bold color={theme.colors.primary}>
            Notifications {unread > 0 ? `[${unread} unread]` : ""}
          </Text>
          <Text color={theme.colors.mutedForeground} dimColor>
            Esc: clear
          </Text>
        </Box>
        {visible.map((n) => {
          const color = variantColor(n.variant, theme.colors);
          const icon = variantIcon(n.variant);
          return (
            <Box
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
              <Box flexDirection="row" gap={1}>
                <Text color={color} bold>
                  {icon}
                </Text>
                <Text
                  bold
                  color={
                    n.read
                      ? theme.colors.mutedForeground
                      : theme.colors.foreground
                  }
                >
                  {n.title}
                </Text>
              </Box>
              {n.body && (
                <Text color={theme.colors.mutedForeground} dimColor>
                  {n.body}
                </Text>
              )}
            </Box>
          );
        })}
      </Box>
    </NotificationsContext.Provider>
  );
};
