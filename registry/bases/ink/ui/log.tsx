import { Box, Text } from "ink";
import React, { useState, useMemo, useEffect } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp?: Date;
}

export interface LogProps {
  entries: LogEntry[];
  height?: number;
  showTimestamp?: boolean;
  filter?: string;
  follow?: boolean;
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
}: LogProps) => {
  const theme = useTheme();
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

  useInput((input, key) => {
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
    }
  });

  const visible = filtered.slice(scrollOffset, scrollOffset + height);

  return (
    <Box flexDirection="column" gap={0}>
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
            <Box key={i} gap={1}>
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
      <Box gap={2} marginTop={0}>
        <Text color={theme.colors.mutedForeground} dimColor>
          {scrollOffset + 1}–{Math.min(scrollOffset + height, filtered.length)}/
          {filtered.length}
        </Text>
        <Text
          color={follow ? theme.colors.success : theme.colors.mutedForeground}
          dimColor
        >
          {follow ? "↓ follow" : "f follow"}
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
