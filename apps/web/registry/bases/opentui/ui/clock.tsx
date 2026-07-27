/* @jsxImportSource @opentui/react */
import React, { useState, useEffect, useCallback } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface ClockProps {
  format?: "12h" | "24h";
  showSeconds?: boolean;
  showDate?: boolean;
  timezone?: string;
  color?: string;
  size?: "sm" | "lg";
}

const BIG_DIGITS: Record<string, string[]> = {
  " ": ["   ", "   ", "   ", "   ", "   "],
  "0": ["╔═╗", "║ ║", "║ ║", "║ ║", "╚═╝"],
  "1": [" ╗ ", " ║ ", " ║ ", " ║ ", " ╩ "],
  "2": ["╔═╗", "  ║", "╔═╝", "║  ", "╚══"],
  "3": ["╔═╗", "  ║", " ═╣", "  ║", "╚═╝"],
  "4": ["╗ ╗", "║ ║", "╚═╣", "  ║", "  ╩"],
  "5": ["╔══", "║  ", "╚═╗", "  ║", "╚═╝"],
  "6": ["╔══", "║  ", "╠═╗", "║ ║", "╚═╝"],
  "7": ["╔═╗", "  ║", "  ║", "  ║", "  ╩"],
  "8": ["╔═╗", "║ ║", "╠═╣", "║ ║", "╚═╝"],
  "9": ["╔═╗", "║ ║", "╚═╣", "  ║", "╚═╝"],
  ":": ["   ", " ● ", "   ", " ● ", "   "],
};

const renderBigText = (str: string, color: string): React.ReactElement => {
  const rows: string[] = ["", "", "", "", ""];
  for (const ch of str) {
    const segs = BIG_DIGITS[ch] ?? BIG_DIGITS[" "] ?? [];
    for (let r = 0; r < 5; r += 1) {
      rows[r] += segs[r];
    }
  }
  return (
    <box flexDirection="column">
      {rows.map((row, i) => (
        <text key={i} fg={color}>
          {row}
        </text>
      ))}
    </box>
  );
};

const padNum = (n: number) => String(n).padStart(2, "0");

const getTimeParts = (
  format: "12h" | "24h",
  showSeconds: boolean,
  timezone?: string
) => {
  const now = timezone
    ? new Date(new Date().toLocaleString("en-US", { timeZone: timezone }))
    : new Date();

  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  let ampm = "";

  if (format === "12h") {
    ampm = hours >= 12 ? " PM" : " AM";
    hours = hours % 12 || 12;
  }

  const time = showSeconds
    ? `${padNum(hours)}:${padNum(minutes)}:${padNum(seconds)}`
    : `${padNum(hours)}:${padNum(minutes)}`;

  return { ampm, time };
};

const getDateString = (timezone?: string): string => {
  const now = timezone
    ? new Date(new Date().toLocaleString("en-US", { timeZone: timezone }))
    : new Date();
  return now.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    weekday: "short",
    year: "numeric",
  });
};

export const Clock = ({
  format = "24h",
  showSeconds = true,
  showDate = false,
  timezone,
  color,
  size = "sm",
}: ClockProps) => {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.primary;

  const [_tick, setTick] = useState(0);
  const tick = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  const { time, ampm } = getTimeParts(format, showSeconds, timezone);

  if (size === "lg") {
    return (
      <box flexDirection="column" gap={0}>
        {showDate && (
          <text fg={theme.colors.mutedForeground}>
            {getDateString(timezone)}
          </text>
        )}
        <box alignItems="flex-end" gap={0}>
          {renderBigText(time, resolvedColor)}
          {ampm && (
            <text fg={theme.colors.mutedForeground}>
              <b>{ampm}</b>
            </text>
          )}
        </box>
      </box>
    );
  }

  return (
    <box flexDirection="column" gap={0}>
      {showDate && (
        <text fg={theme.colors.mutedForeground}>{getDateString(timezone)}</text>
      )}
      <box gap={0}>
        <text fg={resolvedColor}>
          <b>{time}</b>
        </text>
        {ampm && <text fg={theme.colors.mutedForeground}>{ampm}</text>}
      </box>
    </box>
  );
};
