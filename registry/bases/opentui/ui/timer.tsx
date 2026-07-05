/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState, useCallback, useEffect } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface TimerProps {
  duration: number;
  onComplete?: () => void;
  autoStart?: boolean;
  format?: "hms" | "ms" | "s";
  color?: string;
  label?: string;
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
}: TimerProps) => {
  const theme = useTheme();
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

  useEffect(() => {
    if (!running) {
      return;
    }
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running, tick]);

  useKeyboard((key) => {
    if (key.name === " ") {
      if (!completed) {
        setRunning((r) => !r);
      }
    } else if (key.name === "r") {
      setRemaining(duration);
      setRunning(false);
      setCompleted(false);
    }
  });

  const runningStatus = running ? "Running" : "Paused";
  const status = completed ? "Done!" : runningStatus;
  const runningStatusColor = running
    ? resolvedColor
    : theme.colors.mutedForeground;
  const statusColor = completed ? theme.colors.success : runningStatusColor;

  return (
    <box flexDirection="column" gap={0}>
      {label && <text fg={theme.colors.mutedForeground}>{label}</text>}
      <box gap={2} alignItems="center">
        <text fg={resolvedColor}>
          <b>{formatTime(remaining, format)}</b>
        </text>
        <text fg={statusColor}>{`[${status}]`}</text>
      </box>
      <text fg="#666">
        {completed ? "r to reset" : "space pause/resume · r reset"}
      </text>
    </box>
  );
};
