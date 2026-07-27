import { Box, Text } from "ink";
import React, { useState, useMemo, useEffect } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp?: Date;
}

export interface LogProps extends InteractionProps {
  entries: LogEntry[];
  height?: number;
  showTimestamp?: boolean;
  filter?: string;
  follow?: boolean;
  "aria-label"?: string;
}

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: "gray",
  error: "red",
  info: "cyan",
  warn: "yellow",
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: "DBG",
  error: "ERR",
  info: "INF",
  warn: "WRN",
};

const formatTimestamp = (date: Date): string => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export const Log = ({
  entries,
  height = 10,
  showTimestamp = true,
  filter,
  follow: followProp = false,
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel = "Application log",
}: LogProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [follow, setFollow] = useState(followProp);

  const filtered = useMemo(() => {
    if (!filter) {
      return entries;
    }
    const lower = filter.toLowerCase();
    return entries.filter(
      (e) =>
        e.message.toLowerCase().includes(lower) ||
        e.level.toLowerCase().includes(lower)
    );
  }, [entries, filter]);

  const maxOffset = Math.max(0, filtered.length - height);

  useEffect(() => {
    if (follow) {
      setScrollOffset(maxOffset);
    }
  }, [follow, maxOffset]);

  const { isFocused } = useInteraction(
    (input, key) => {
      if (input === "j" || key.downArrow) {
        setScrollOffset((o) => Math.min(maxOffset, o + 1));
        if (follow) {
          setFollow(false);
        }
      } else if (input === "k" || key.upArrow) {
        setScrollOffset((o) => Math.max(0, o - 1));
        if (follow) {
          setFollow(false);
        }
      } else if (input === "f") {
        setFollow((f) => !f);
      } else if (key.home) {
        setScrollOffset(0);
        setFollow(false);
      } else if (key.end) {
        setScrollOffset(maxOffset);
      } else if (key.pageUp) {
        setScrollOffset((offset) => Math.max(0, offset - height));
      } else if (key.pageDown) {
        setScrollOffset((offset) => Math.min(maxOffset, offset + height));
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const visible = filtered.slice(scrollOffset, scrollOffset + height);

  return (
    <Box
      flexDirection="column"
      gap={0}
      aria-role="list"
      aria-state={{ disabled: disabled || undefined }}
    >
      <Text
        aria-label={`${ariaLabel}. Showing ${visible.length} of ${filtered.length} entries.${isFocused ? " Focused." : ""}`}
      >
        {""}
      </Text>
      <Box flexDirection="column" height={height}>
        {visible.map((entry, i) => {
          const levelColor = LEVEL_COLORS[entry.level];
          const levelLabel = LEVEL_LABELS[entry.level];
          let messageColor: string;
          if (entry.level === "error") {
            messageColor = "red";
          } else if (entry.level === "warn") {
            messageColor = "yellow";
          } else {
            messageColor = theme.colors.foreground;
          }
          return (
            <Box
              key={`${entry.timestamp?.getTime() ?? scrollOffset + i}-${i}`}
              gap={1}
              aria-role="listitem"
              aria-label={`${entry.level}${entry.timestamp ? ` at ${formatTimestamp(entry.timestamp)}` : ""}: ${entry.message}`}
            >
              {showTimestamp && entry.timestamp && (
                <Text color={theme.colors.mutedForeground} dimColor>
                  {formatTimestamp(entry.timestamp)}
                </Text>
              )}
              <Text color={levelColor} bold>
                {levelLabel}
              </Text>
              <Text color={messageColor}>{entry.message}</Text>
            </Box>
          );
        })}
      </Box>
      <Box aria-hidden gap={2} marginTop={0}>
        <Text color={theme.colors.mutedForeground} dimColor>
          {scrollOffset + 1}
          {unicode ? "–" : "-"}
          {Math.min(scrollOffset + height, filtered.length)}/{filtered.length}
        </Text>
        <Text
          color={follow ? theme.colors.success : theme.colors.mutedForeground}
          dimColor
        >
          {follow ? (unicode ? "↓ follow" : "down follow") : "f follow"}
        </Text>
        <Text color={theme.colors.mutedForeground} dimColor>
          j/k scroll
        </Text>
        {filter && (
          <Text color={theme.colors.mutedForeground} dimColor>
            filter: {filter}
          </Text>
        )}
      </Box>
    </Box>
  );
};
