/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState, useCallback, useRef, useEffect } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface StopwatchProps {
  autoStart?: boolean;
  color?: string;
  showLaps?: boolean;
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
}: StopwatchProps) => {
  const theme = useTheme();
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

  useEffect(() => {
    if (!running) {
      return;
    }
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, [running, tick]);

  useKeyboard((key) => {
    if (key.name === " ") {
      if (!running) {
        lastTickRef.current = Date.now();
      }
      setRunning((r) => !r);
    } else if (key.name === "l" && running) {
      setLaps((prev) => [...prev, elapsedRef.current]);
    } else if (key.name === "r") {
      setRunning(false);
      setElapsed(0);
      elapsedRef.current = 0;
      setLaps([]);
    }
  });

  const status = getStatus(running, elapsed);
  const statusColor = getStatusColor(running, elapsed, resolvedColor, theme);

  return (
    <box flexDirection="column" gap={0}>
      <box gap={2} alignItems="center">
        <text fg={resolvedColor}>
          <b>{formatElapsed(elapsed)}</b>
        </text>
        <text fg={statusColor}>{`[${status}]`}</text>
      </box>
      <text fg="#666">space start/stop · l lap · r reset</text>
      {showLaps && laps.length > 0 && (
        <box flexDirection="column" marginTop={1}>
          <text fg={theme.colors.mutedForeground}>
            <b>Laps:</b>
          </text>
          {laps.map((lapTime, i) => {
            const prevLap = laps[i - 1] ?? 0;
            const split = i === 0 ? lapTime : lapTime - prevLap;
            return (
              <box key={i} gap={2}>
                <text
                  fg={theme.colors.mutedForeground}
                >{`#${String(i + 1).padStart(2, "0")}`}</text>
                <text fg={resolvedColor}>{formatElapsed(lapTime)}</text>
                <text fg="#666">{`+${formatElapsed(split)}`}</text>
              </box>
            );
          })}
        </box>
      )}
    </box>
  );
};
