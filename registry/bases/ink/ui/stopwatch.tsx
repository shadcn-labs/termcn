import { Box, Text } from "ink";
import React, { useState, useCallback, useRef } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useInterval } from "@/hooks/use-interval";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";

export interface StopwatchProps extends InteractionProps {
  autoStart?: boolean;
  color?: string;
  showLaps?: boolean;
  "aria-label"?: string;
}

const pad = (n: number, len = 2) => String(n).padStart(len, "0");

const formatElapsed = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const centis = Math.floor((ms % 1000) / 10);

  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(centis)}`;
};

const getStatus = (running: boolean, elapsed: number): string => {
  if (running) {
    return "Running";
  }
  if (elapsed === 0) {
    return "Ready";
  }
  return "Stopped";
};

const getStatusColor = (
  running: boolean,
  elapsed: number,
  resolvedColor: string,
  theme: ReturnType<typeof useTheme>
): string => {
  if (running) {
    return resolvedColor;
  }
  if (elapsed === 0) {
    return theme.colors.mutedForeground;
  }
  return theme.colors.warning;
};

export const Stopwatch = ({
  autoStart = false,
  color,
  showLaps = true,
  id,
  autoFocus,
  isActive = true,
  disabled,
  "aria-label": ariaLabel,
}: StopwatchProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedColor = color ?? theme.colors.primary;

  const [running, setRunning] = useState(autoStart);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const lastTickRef = useRef<number>(autoStart ? Date.now() : 0);
  const elapsedRef = useRef(0);

  const tick = useCallback(() => {
    const now = Date.now();
    const delta = now - lastTickRef.current;
    lastTickRef.current = now;
    elapsedRef.current += delta;
    setElapsed(elapsedRef.current);
  }, []);

  useInterval(tick, running ? 50 : null, { isActive });

  const { isFocused } = useInteraction(
    (input) => {
      if (input === " ") {
        if (!running) {
          lastTickRef.current = Date.now();
        }
        setRunning((r) => !r);
      } else if (input === "l" && running) {
        setLaps((prev) => [...prev, elapsedRef.current]);
      } else if (input === "r") {
        setRunning(false);
        setElapsed(0);
        elapsedRef.current = 0;
        setLaps([]);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const status = getStatus(running, elapsed);
  const statusColor = getStatusColor(running, elapsed, resolvedColor, theme);

  return (
    <Box
      flexDirection="column"
      gap={0}
      aria-role="timer"
      aria-label={
        ariaLabel ??
        `Stopwatch: ${formatElapsed(elapsed)}. ${status}. ${laps.length} laps.`
      }
      aria-state={{ busy: running, disabled: disabled || undefined }}
    >
      <Box gap={2} alignItems="center">
        <Text color={resolvedColor} bold>
          {formatElapsed(elapsed)}
        </Text>
        <Text color={statusColor}>[{status}]</Text>
      </Box>
      <Text aria-hidden color={theme.colors.mutedForeground} dimColor>
        {unicode
          ? "space start/stop · l lap · r reset"
          : "space start/stop - l lap - r reset"}
      </Text>
      {isFocused && <Text aria-hidden>Focused</Text>}
      {showLaps && laps.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color={theme.colors.mutedForeground} bold>
            Laps:
          </Text>
          {laps.map((lapTime, i) => {
            const prevLap = laps[i - 1] ?? 0;
            const split = i === 0 ? lapTime : lapTime - prevLap;
            return (
              <Box key={i} gap={2}>
                <Text color={theme.colors.mutedForeground}>
                  #{String(i + 1).padStart(2, "0")}
                </Text>
                <Text color={resolvedColor}>{formatElapsed(lapTime)}</Text>
                <Text color={theme.colors.mutedForeground} dimColor>
                  +{formatElapsed(split)}
                </Text>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
