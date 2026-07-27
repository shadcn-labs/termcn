/* @jsxImportSource @opentui/react */
import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface BarChartItem {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarChartItem[];
  direction?: "horizontal" | "vertical";
  width?: number;
  height?: number;
  showValues?: boolean;
  title?: string;
}

const BAR_CHAR = "█";
const EMPTY_CHAR = "░";

const pad = (str: string, length: number): string => {
  if (str.length >= length) {
    return str.slice(0, length);
  }
  return `${str} `.repeat(length - str.length);
};

const padStart = (str: string, length: number): string => {
  if (str.length >= length) {
    return str.slice(0, length);
  }
  return " ".repeat(length - str.length) + str;
};

export const BarChart = ({
  data,
  direction = "horizontal",
  width = 30,
  height = 10,
  showValues = true,
  title,
}: BarChartProps) => {
  const theme = useTheme();

  if (data.length === 0) {
    return <text fg={theme.colors.mutedForeground}>No data</text>;
  }

  const maxValue = Math.max(...data.map((d) => d.value));

  if (direction === "horizontal") {
    const maxLabelLen = Math.max(...data.map((d) => d.label.length));
    const maxValLen = Math.max(...data.map((d) => String(d.value).length));
    const barWidth = width - maxLabelLen - maxValLen - 3;

    return (
      <box flexDirection="column">
        {title && (
          <text fg={theme.colors.primary}>
            <b>{title}</b>
          </text>
        )}
        {data.map((item, idx) => {
          const filled =
            maxValue === 0
              ? 0
              : Math.round((item.value / maxValue) * Math.max(1, barWidth));
          const empty = Math.max(0, barWidth - filled);
          const barStr = BAR_CHAR.repeat(filled) + EMPTY_CHAR.repeat(empty);
          const resolvedColor = item.color ?? theme.colors.primary;
          return (
            <box key={idx} flexDirection="row" gap={1}>
              <text fg={theme.colors.foreground}>
                {pad(item.label, maxLabelLen)}
              </text>
              <text fg={resolvedColor}>{barStr}</text>
              {showValues && (
                <text fg={theme.colors.mutedForeground}>
                  {padStart(String(item.value), maxValLen)}
                </text>
              )}
            </box>
          );
        })}
      </box>
    );
  }

  const barW = Math.max(3, Math.floor(width / data.length));
  const rows: string[][] = [];

  for (let row = height - 1; row >= 0; row -= 1) {
    const threshold = (row / (height - 1)) * maxValue;
    const cells = data.map((item) => {
      const filled = item.value >= threshold;
      return filled ? BAR_CHAR.repeat(barW) : " ".repeat(barW);
    });
    rows.push(cells);
  }

  return (
    <box flexDirection="column">
      {title && (
        <text fg={theme.colors.primary}>
          <b>{title}</b>
        </text>
      )}
      {rows.map((row, rowIdx) => {
        const threshold = ((height - 1 - rowIdx) / (height - 1)) * maxValue;
        return (
          <box key={rowIdx} flexDirection="row">
            {row.map((cell, colIdx) => {
              const item = data[colIdx];
              const resolvedColor = item.color ?? theme.colors.primary;
              const isFilled = item.value >= threshold;
              return (
                <text
                  key={colIdx}
                  fg={isFilled ? resolvedColor : theme.colors.muted}
                >
                  {cell}
                </text>
              );
            })}
          </box>
        );
      })}
      {showValues && (
        <box flexDirection="row">
          {data.map((item, idx) => {
            const resolvedColor = item.color ?? theme.colors.primary;
            return (
              <text key={idx} fg={resolvedColor}>
                {pad(String(item.value), barW)}
              </text>
            );
          })}
        </box>
      )}
      <box flexDirection="row">
        {data.map((item, idx) => (
          <text key={idx} fg={theme.colors.mutedForeground}>
            {pad(item.label, barW)}
          </text>
        ))}
      </box>
    </box>
  );
};
