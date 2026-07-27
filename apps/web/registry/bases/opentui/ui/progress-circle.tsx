/* @jsxImportSource @opentui/react */
import { useTheme } from "@/components/ui/opentui-theme-provider";

export type ProgressCircleSize = "sm" | "md" | "lg";

export interface ProgressCircleProps {
  value: number;
  size?: ProgressCircleSize;
  color?: string;
  label?: string;
  showPercent?: boolean;
}

const BRAILLE_CHARS = ["○", "◔", "◑", "◕", "●", "◉", "⬤", "●"];

const _MD_TOP = ["▄▄▄", "▄██▄"];
const _MD_MID_EMPTY = "█   █";
const _MD_MID_FILL = "█████";
const _MD_BOT = ["▀▀▀", "▀██▀"];

const getSmChar = (value: number): string => {
  const clamped = Math.max(0, Math.min(100, value));
  const step = Math.floor((clamped / 100) * 7);
  return BRAILLE_CHARS[step];
};

export const ProgressCircle = ({
  value,
  size = "sm",
  color,
  label,
  showPercent = false,
}: ProgressCircleProps) => {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(100, value));
  const resolvedColor = color ?? theme.colors.primary;

  if (size === "sm") {
    const char = getSmChar(clamped);
    return (
      <box flexDirection="column" alignItems="flex-start">
        <box flexDirection="row" gap={1}>
          <text fg={resolvedColor}>{char}</text>
          {showPercent && (
            <text fg={theme.colors.muted}>{`${Math.round(clamped)}%`}</text>
          )}
        </box>
        {label && <text fg={theme.colors.muted}>{label}</text>}
      </box>
    );
  }

  const percentLabel = `${Math.round(clamped)}%`;

  if (size === "md") {
    return (
      <box flexDirection="column" alignItems="flex-start">
        <box flexDirection="row">
          <text fg={resolvedColor}>⟨</text>
          <text fg={resolvedColor}>
            <b>{percentLabel}</b>
          </text>
          <text fg={resolvedColor}>⟩</text>
        </box>
        {label && <text fg={theme.colors.muted}>{label}</text>}
      </box>
    );
  }

  const fillLevel = clamped / 100;
  const topArc = " ▄█▄";
  const midLeft = "█";
  const midRight = "█";
  const midInner = fillLevel >= 0.5 ? "███" : "   ";
  const botArc = " ▀█▀";

  return (
    <box flexDirection="column" alignItems="flex-start">
      <text fg={resolvedColor}>{topArc}</text>
      <box flexDirection="row">
        <text fg={resolvedColor}>{midLeft}</text>
        <text fg={fillLevel > 0 ? resolvedColor : theme.colors.muted}>
          {midInner}
        </text>
        <text fg={resolvedColor}>{midRight}</text>
      </box>
      <text fg={resolvedColor}>{botArc}</text>
      {showPercent && <text fg={theme.colors.muted}>{percentLabel}</text>}
      {label && <text fg={theme.colors.muted}>{label}</text>}
    </box>
  );
};
