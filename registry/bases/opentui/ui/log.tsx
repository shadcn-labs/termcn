/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState, useMemo, useEffect } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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

  useKeyboard((key) => {
    if (key.name === "j" || key.name === "down") {
      setScrollOffset((o) => Math.min(maxOffset, o + 1));
      if (follow) {
        setFollow(false);
      }
    } else if (key.name === "k" || key.name === "up") {
      setScrollOffset((o) => Math.max(0, o - 1));
      if (follow) {
        setFollow(false);
      }
    } else if (key.name === "f") {
      setFollow((f) => !f);
    }
  });

  const visible = filtered.slice(scrollOffset, scrollOffset + height);

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="column">
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
            <box key={i} gap={1}>
              {showTimestamp && entry.timestamp && (
                <text fg="#666">{formatTimestamp(entry.timestamp)}</text>
              )}
              <text fg={levelColor}>
                <b>{levelLabel}</b>
              </text>
              <text fg={messageColor}>{entry.message}</text>
            </box>
          );
        })}
      </box>
      <box gap={2} marginTop={0}>
        <text fg="#666">{`${scrollOffset + 1}–${Math.min(scrollOffset + height, filtered.length)}/${filtered.length}`}</text>
        <text fg={follow ? theme.colors.success : "#666"}>
          {follow ? "↓ follow" : "f follow"}
        </text>
        <text fg="#666">j/k scroll</text>
        {filter && <text fg="#666">{`filter: ${filter}`}</text>}
      </box>
    </box>
  );
};
