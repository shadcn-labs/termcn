import { Box, Text } from "ink";
import React, { useState, useCallback } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useInterval } from "@/hooks/use-interval";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";

export interface TimerProps extends InteractionProps {
  duration: number;
  onComplete?: () => void;
  autoStart?: boolean;
  format?: "hms" | "ms" | "s";
  color?: string;
  label?: string;
  "aria-label"?: string;
}

const padNum = (n: number) => String(n).padStart(2, "0");

const formatTime = (seconds: number, format: "hms" | "ms" | "s"): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (format === "s") {
    return `${seconds}s`;
  }
  if (format === "ms") {
    return `${padNum(m)}:${padNum(s)}`;
  }
  return `${padNum(h)}:${padNum(m)}:${padNum(s)}`;
};

export const Timer = ({
  duration,
  onComplete,
  autoStart = false,
  format = "hms",
  color,
  label,
  id,
  autoFocus,
  isActive = true,
  disabled,
  "aria-label": ariaLabel,
}: TimerProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedColor = color ?? theme.colors.primary;

  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(autoStart);
  const [completed, setCompleted] = useState(false);

  const tick = useCallback(() => {
    setRemaining((prev) => {
      if (prev <= 1) {
        setRunning(false);
        setCompleted(true);
        onComplete?.();
        return 0;
      }
      return prev - 1;
    });
  }, [onComplete]);

  useInterval(tick, running ? 1000 : null, { isActive });

  const { isFocused } = useInteraction(
    (input) => {
      if (input === " ") {
        if (!completed) {
          setRunning((r) => !r);
        }
      } else if (input === "r") {
        setRemaining(duration);
        setRunning(false);
        setCompleted(false);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const runningStatus = running ? "Running" : "Paused";
  const status = completed ? "Done!" : runningStatus;
  const runningStatusColor = running
    ? resolvedColor
    : theme.colors.mutedForeground;
  const statusColor = completed ? theme.colors.success : runningStatusColor;

  return (
    <Box
      flexDirection="column"
      gap={0}
      aria-role="timer"
      aria-label={
        ariaLabel ??
        `${label ? `${label}. ` : ""}${formatTime(remaining, format)} remaining. ${status}.`
      }
      aria-state={{ busy: running, disabled: disabled || undefined }}
    >
      {label && <Text color={theme.colors.mutedForeground}>{label}</Text>}
      <Box gap={2} alignItems="center">
        <Text color={resolvedColor} bold>
          {formatTime(remaining, format)}
        </Text>
        <Text color={statusColor}>[{status}]</Text>
      </Box>
      <Text aria-hidden color={theme.colors.mutedForeground} dimColor>
        {completed
          ? "r to reset"
          : unicode
            ? "space pause/resume · r reset"
            : "space pause/resume - r reset"}
      </Text>
      {isFocused && <Text aria-hidden>Focused</Text>}
    </Box>
  );
};
