import { useIsScreenReaderEnabled, Box, Text } from "ink";
import React, { useEffect } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import {
  useNotificationsProvider,
  NotificationsContext,
} from "@/hooks/use-notifications";
import type { NotificationVariant } from "@/hooks/use-notifications";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

export interface NotificationCenterProps extends InteractionProps {
  maxVisible?: number;
  width?: number;
  "aria-label"?: string;
}

const variantIcon = (v: NotificationVariant, unicode: boolean): string => {
  switch (v) {
    case "success": {
      return unicode ? "✓" : "v";
    }
    case "warning": {
      return "!";
    }
    case "error": {
      return unicode ? "✗" : "x";
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
  id,
  autoFocus,
  isActive = true,
  disabled,
  "aria-label": ariaLabel = "Notifications",
}: NotificationCenterProps) => {
  const unicode = useUnicode();
  const ctx = useNotificationsProvider();
  const theme = useTheme();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
  const { notifications, dismiss, clear } = ctx;

  const visible = notifications.slice(-maxVisible);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const n of notifications) {
      if (!n.persistent) {
        const dur = n.duration ?? 5000;
        const elapsed = Date.now() - n.timestamp;
        const remaining = dur - elapsed;
        if (remaining <= 0) {
          dismiss(n.id);
        } else {
          timers.push(setTimeout(() => dismiss(n.id), remaining));
        }
      }
    }
    return () => {
      for (const timer of timers) {
        clearTimeout(timer);
      }
    };
  }, [notifications, dismiss]);

  const { isFocused } = useInteraction(
    (_input, key) => {
      if (key.escape) {
        clear();
      }
    },
    { autoFocus, disabled, id, isActive: isActive && visible.length > 0 }
  );

  if (visible.length === 0) {
    return null;
  }

  return (
    <NotificationsContext.Provider value={ctx}>
      <Box
        flexDirection="column"
        width={width}
        aria-role="list"
        aria-state={{ disabled: disabled || undefined }}
      >
        <Text
          aria-label={`${ariaLabel}. ${visible.length} visible, ${unread} unread.${isFocused ? " Focused; Escape clears all." : ""}`}
        >
          {""}
        </Text>
        <Box
          flexDirection="row"
          justifyContent="space-between"
          marginBottom={0}
        >
          <Text bold color={theme.colors.primary}>
            Notifications {unread > 0 ? `[${unread} unread]` : ""}
          </Text>
          <Text aria-hidden color={theme.colors.mutedForeground} dimColor>
            Esc: clear
          </Text>
        </Box>
        {visible.map((n) => {
          const color = variantColor(n.variant, theme.colors);
          const icon = variantIcon(n.variant, unicode);
          return (
            <Box
              key={n.id}
              flexDirection="column"
              borderStyle={resolveBorderStyle(
                isScreenReaderEnabled ? undefined : "single",
                unicode
              )}
              borderColor={color}
              padding={0}
              paddingLeft={1}
              paddingRight={1}
              marginTop={0}
              width={width}
              aria-role="listitem"
            >
              <Text
                aria-label={`${n.variant} notification: ${n.title}${n.body ? `. ${n.body}` : ""}${n.read ? ". Read." : ". Unread."}`}
              >
                {""}
              </Text>
              <Box flexDirection="row" gap={1}>
                <Text aria-hidden color={color} bold>
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
