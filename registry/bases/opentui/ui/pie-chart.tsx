/* @jsxImportSource @opentui/react */

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface PieChartItem {
  label: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieChartItem[];
  radius?: number;
  showLegend?: boolean;
  showPercentages?: boolean;
}

const DEFAULT_COLORS = [
  "#7c3aed",
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#0891b2",
  "#be185d",
  "#65a30d",
];

const FULL_BLOCK = "█";
const _HALF_BLOCK = "▌";
const LEGEND_SQUARE = "■";

const buildPieGrid = (
  data: PieChartItem[],
  radius: number
): {
  char: string;
  color: string;
}[][] => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return [];
  }

  const cols = radius * 4;
  const rows = radius * 2;
  const cx = cols / 2;
  const cy = rows / 2;

  const grid: {
    char: string;
    color: string;
  }[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ char: " ", color: "" }))
  );

  const angles: {
    color: string;
    end: number;
    start: number;
  }[] = [];
  let cumulative = 0;
  for (const item of data) {
    const slice = (item.value / total) * Math.PI * 2;
    angles.push({
      color: item.color ?? "",
      end: cumulative + slice,
      start: cumulative,
    });
    cumulative += slice;
  }

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const dx = (col - cx) / 2;
      const dy = row - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        continue;
      }
      let angle = Math.atan2(dy, dx) + Math.PI / 2;
      if (angle < 0) {
        angle += Math.PI * 2;
      }
      const seg =
        angles.find((a) => angle >= a.start && angle < a.end) ?? angles.at(-1);
      if (seg) {
        grid[row][col] = { char: FULL_BLOCK, color: seg.color };
      }
    }
  }

  return grid;
};

export const PieChart = ({
  data,
  radius = 5,
  showLegend = true,
  showPercentages = true,
}: PieChartProps) => {
  const theme = useTheme();

  if (data.length === 0) {
    return <text fg={theme.colors.mutedForeground}>No data</text>;
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  const itemsWithColors = data.map((item, idx) => ({
    ...item,
    color:
      item.color ??
      DEFAULT_COLORS[idx % DEFAULT_COLORS.length] ??
      theme.colors.primary,
  }));

  const grid = buildPieGrid(itemsWithColors, radius);

  return (
    <box flexDirection="row" gap={2}>
      <box flexDirection="column">
        {grid.map((row, rowIdx) => (
          <box key={rowIdx} flexDirection="row">
            {row.map((cell, colIdx) =>
              cell.char === " " ? (
                <text key={colIdx}> </text>
              ) : (
                <text key={colIdx} fg={cell.color || theme.colors.primary}>
                  {cell.char}
                </text>
              )
            )}
          </box>
        ))}
      </box>

      {showLegend && (
        <box flexDirection="column" justifyContent="center">
          {itemsWithColors.map((item, idx) => {
            const pct =
              total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
            return (
              <box key={idx} flexDirection="row" gap={1}>
                <text fg={item.color}>{LEGEND_SQUARE}</text>
                <text fg={theme.colors.foreground}>{item.label}</text>
                {showPercentages && (
                  <text fg={theme.colors.mutedForeground}>{`(${pct}%)`}</text>
                )}
              </box>
            );
          })}
        </box>
      )}
    </box>
  );
};
