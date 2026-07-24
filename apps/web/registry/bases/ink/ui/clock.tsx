import { Box, Text } from "ink";
import React, { useState, useCallback } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInterval } from "@/hooks/use-interval";

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
  const rows: string[] = ["", "", "", ""];
  for (const ch of str) {
    const segs = BIG_DIGITS[ch] ?? BIG_DIGITS[" "] ?? [];
    for (let r = 0; r < 5; r += 1) {
      rows[r] += segs[r];
    }
  }
  return (
    <Box flexDirection="column">
      {rows.map((row, i) => (
        <Text key={i} color={color}>
          {row}
        </Text>
      ))}
    </Box>
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
  useInterval(
    useCallback(() => setTick((t) => t + 1), []),
    1000
  );

  const { time, ampm } = getTimeParts(format, showSeconds, timezone);

  if (size === "lg") {
    return (
      <Box flexDirection="column" gap={0}>
        {showDate && (
          <Text color={theme.colors.mutedForeground}>
            {getDateString(timezone)}
          </Text>
        )}
        <Box alignItems="flex-end" gap={0}>
          {renderBigText(time, resolvedColor)}
          {ampm && (
            <Text color={theme.colors.mutedForeground} bold>
              {ampm}
            </Text>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={0}>
      {showDate && (
        <Text color={theme.colors.mutedForeground}>
          {getDateString(timezone)}
        </Text>
      )}
      <Box gap={0}>
        <Text color={resolvedColor} bold>
          {time}
        </Text>
        {ampm && <Text color={theme.colors.mutedForeground}>{ampm}</Text>}
      </Box>
    </Box>
  );
};
