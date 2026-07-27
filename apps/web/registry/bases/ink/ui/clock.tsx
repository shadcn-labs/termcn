import { Box, Text } from "ink";
import React, { useState, useCallback } from "react";

import { useInterval } from "@/hooks/use-interval";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { toAsciiComponentText } from "@/registry/bases/ink/lib/accessibility";

export interface ClockProps {
  format?: "12h" | "24h";
  showSeconds?: boolean;
  showDate?: boolean;
  timezone?: string;
  color?: string;
  size?: "sm" | "lg";
  isActive?: boolean;
  "aria-label"?: string;
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

const renderBigText = (
  str: string,
  color: string,
  unicode: boolean
): React.ReactElement => {
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
          {unicode ? row : toAsciiComponentText(row)}
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
  isActive = true,
  "aria-label": ariaLabel,
}: ClockProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedColor = color ?? theme.colors.primary;

  const [_tick, setTick] = useState(0);
  useInterval(
    useCallback(() => setTick((t) => t + 1), []),
    1000,
    { isActive }
  );

  const { time, ampm } = getTimeParts(format, showSeconds, timezone);

  if (size === "lg") {
    return (
      <Box
        flexDirection="column"
        gap={0}
        aria-role="timer"
        aria-label={
          ariaLabel ??
          `Clock: ${time}${ampm}${showDate ? `. ${getDateString(timezone)}` : ""}`
        }
      >
        {showDate && (
          <Text color={theme.colors.mutedForeground}>
            {getDateString(timezone)}
          </Text>
        )}
        <Box alignItems="flex-end" gap={0}>
          {renderBigText(time, resolvedColor, unicode)}
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
    <Box
      flexDirection="column"
      gap={0}
      aria-role="timer"
      aria-label={
        ariaLabel ??
        `Clock: ${time}${ampm}${showDate ? `. ${getDateString(timezone)}` : ""}`
      }
    >
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
