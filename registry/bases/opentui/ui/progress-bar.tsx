/* @jsxImportSource @opentui/react */

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface ProgressBarProps {
  value: number;
  total?: number;
  width?: number;
  showPercent?: boolean;
  showEta?: boolean;
  fillChar?: string;
  emptyChar?: string;
  color?: string;
  label?: string;
}

export const ProgressBar = ({
  value,
  total,
  width = 30,
  showPercent = true,
  showEta: _showEta = false,
  fillChar = "█",
  emptyChar = "░",
  color,
  label,
}: ProgressBarProps) => {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.primary;

  const percent =
    total === undefined
      ? Math.min(100, Math.round(value))
      : Math.min(100, Math.round((value / total) * 100));
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;

  const bar = fillChar.repeat(filled) + emptyChar.repeat(empty);

  return (
    <box flexDirection="column">
      {label && <text>{label}</text>}
      <box gap={1}>
        <text fg={resolvedColor}>{bar}</text>
        {showPercent && (
          <text fg={theme.colors.mutedForeground}>{`${percent}%`}</text>
        )}
        {total !== undefined && <text fg="#666">{`${value}/${total}`}</text>}
      </box>
    </box>
  );
};
