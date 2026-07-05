/* @jsxImportSource @opentui/react */
import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface UsageMonitorProps {
  refreshInterval?: number;
  separatorChar?: string;
  children: ReactNode;
}

export interface UsageMonitorHeaderProps {
  title: string;
  titleColor?: string;
  decorator?: string;
  separatorChar?: string;
  separatorColor?: string;
}

export interface UsageMonitorTagsProps {
  items: string[];
  bracketColor?: string;
  separatorColor?: string;
}

export interface UsageMonitorSectionProps {
  icon?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export interface UsageMonitorMetricProps {
  icon?: string;
  label: string;
  value: number;
  max: number;
  percent: number;
  status: "green" | "yellow" | "red" | "blue";
  format: "number" | "currency" | "duration" | "percent" | "custom";
  formatFn?: (v: number, max: number) => string;
  barWidth?: number;
  barFillChar?: string;
  barEmptyChar?: string;
  barColor?: string;
  maxDim?: boolean;
  showMax?: boolean;
}

export interface UsageMonitorDistributionMetricProps {
  icon?: string;
  label: string;
  segments: {
    label: string;
    percent: number;
    color?: string;
  }[];
  barWidth?: number;
}

export interface UsageMonitorStatRowProps {
  icon?: string;
  label: string;
  value: string;
  valueSuffix?: string;
  valueColor?: string;
}

export interface UsageMonitorPredictionProps {
  label: string;
  value: string;
  valueColor?: string;
}

export interface UsageMonitorStatusBarProps {
  clock?: boolean;
  clockColor?: string;
  sessionLabel?: string;
  sessionColor?: string;
  exitHint?: string;
  statusDot?: "green" | "yellow" | "red";
  separator?: string;
}

const formatValue = (
  value: number,
  max: number,
  format: UsageMonitorMetricProps["format"],
  formatFn?: (v: number, max: number) => string
): {
  current: string;
  maxStr: string;
} => {
  if (format === "custom" && formatFn) {
    const result = formatFn(value, max);
    return { current: result, maxStr: "" };
  }
  switch (format) {
    case "currency": {
      return {
        current: `$${value.toFixed(2)}`,
        maxStr: `$${max.toFixed(2)}`,
      };
    }
    case "duration": {
      const h = Math.floor(value / 60);
      const m = value % 60;
      const maxH = Math.floor(max / 60);
      const maxM = max % 60;
      return {
        current: h > 0 ? `${h}h ${m}m` : `${m}m`,
        maxStr: maxH > 0 ? `${maxH}h ${maxM}m` : `${maxM}m`,
      };
    }
    case "percent": {
      return {
        current: `${value.toFixed(1)}%`,
        maxStr: `${max.toFixed(1)}%`,
      };
    }
    case "number": {
      return {
        current: value.toLocaleString(),
        maxStr: max.toLocaleString(),
      };
    }
    default: {
      return { current: String(value), maxStr: String(max) };
    }
  }
};

const statusDotChar = (
  status: "green" | "yellow" | "red"
): {
  char: string;
  color: string;
} => {
  switch (status) {
    case "green": {
      return { char: "●", color: "green" };
    }
    case "yellow": {
      return { char: "◕", color: "yellow" };
    }
    case "red": {
      return { char: "○", color: "red" };
    }
    default: {
      return { char: "●", color: "green" };
    }
  }
};

const UsageMonitorRoot = ({
  refreshInterval = 1000,
  separatorChar = "─",
  children,
}: UsageMonitorProps) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), refreshInterval);
    return () => clearInterval(id);
  }, [refreshInterval]);

  return (
    <box flexDirection="column">
      {React.Children.toArray(children).map((child, i, arr) => {
        const childKey =
          React.isValidElement(child) && child.key !== null ? child.key : i;

        return (
          <box key={childKey} flexDirection="column">
            {child}
            {i < arr.length - 1 &&
              React.isValidElement(child) &&
              (
                child.type as unknown as {
                  displayName?: string;
                }
              ).displayName !== "UsageMonitor.StatusBar" && (
                <text fg="#666">{separatorChar.repeat(44)}</text>
              )}
          </box>
        );
      })}
    </box>
  );
};

const UsageMonitorHeader = ({
  title,
  titleColor = "cyan",
  decorator = "◆ ✦ ◆ ✦",
  separatorChar = "═",
  separatorColor,
}: UsageMonitorHeaderProps) => (
  <box flexDirection="column">
    <box flexDirection="row" justifyContent="center">
      <text fg="#666">{`${decorator}  `}</text>
      <text fg={titleColor}>
        <b>{title}</b>
      </text>
      <text fg="#666">{`  ${decorator}`}</text>
    </box>
    <text fg={separatorColor ?? "#666"}>{separatorChar.repeat(44)}</text>
  </box>
);
UsageMonitorHeader.displayName = "UsageMonitor.Header";

const UsageMonitorTags = ({
  items,
  bracketColor,
  separatorColor,
}: UsageMonitorTagsProps) => (
  <box flexDirection="row" marginBottom={1}>
    <text fg={bracketColor ?? "cyan"}>{"[ "}</text>
    {items.flatMap((item, i) => [
      <text key={`${item}-${i}-label`}>{item}</text>,
      i < items.length - 1 ? (
        <text key={`${item}-${i}-separator`} fg={separatorColor ?? "cyan"}>
          {" | "}
        </text>
      ) : null,
    ])}
    <text fg={bracketColor ?? "cyan"}>{" ]"}</text>
  </box>
);

const UsageMonitorSection = ({
  icon,
  title,
  subtitle,
  children,
}: UsageMonitorSectionProps) => (
  <box flexDirection="column" marginBottom={1}>
    {(icon || title) && (
      <box flexDirection="row" gap={1}>
        {icon && <text>{icon}</text>}
        {title && (
          <text>
            <b>{title}</b>
          </text>
        )}
      </box>
    )}
    {subtitle && <text fg="#666">{`    ${subtitle}`}</text>}
    <box flexDirection="column" paddingTop={1}>
      {children}
    </box>
  </box>
);

const UsageMonitorMetric = ({
  icon,
  label,
  value,
  max,
  percent,
  status,
  format,
  formatFn,
  barWidth = 22,
  barFillChar = "█",
  barEmptyChar = "░",
  barColor = "white",
  maxDim = false,
  showMax = true,
}: UsageMonitorMetricProps) => {
  const filled = Math.round((percent / 100) * barWidth);
  const empty = barWidth - filled;
  const bar = barFillChar.repeat(filled) + barEmptyChar.repeat(empty);
  const dot = statusDotChar(status as "green" | "yellow" | "red");
  const { current, maxStr } = formatValue(value, max, format, formatFn);

  return (
    <box flexDirection="row" gap={1}>
      {icon && <text>{icon}</text>}
      <text fg="#666">{label.padEnd(16)}</text>
      <text fg={dot.color}>{dot.char}</text>
      <text fg={barColor}>{`[${bar}]`}</text>
      <text>{` ${percent.toFixed(1)}%`}</text>
      <text>{` ${current}`}</text>
      {showMax && maxStr && (
        <text fg={maxDim ? "#666" : undefined}>{`/ ${maxStr}`}</text>
      )}
    </box>
  );
};

const UsageMonitorDistributionMetric = ({
  icon,
  label,
  segments,
  barWidth = 22,
}: UsageMonitorDistributionMetricProps) => {
  const bars = segments.map((seg) => {
    const count = Math.round((seg.percent / 100) * barWidth);
    return { ...seg, count };
  });

  return (
    <box flexDirection="row" gap={1}>
      {icon && <text>{icon}</text>}
      <text fg="#666">{label.padEnd(16)}</text>
      <text>[</text>
      {bars.map((seg, i) => (
        <text key={i} fg={seg.color ?? "white"}>
          {"█".repeat(seg.count)}
        </text>
      ))}
      <text>]</text>
      {segments.map((seg, i) => (
        <text
          key={i}
          fg={seg.color ?? "white"}
        >{`${seg.label} ${seg.percent}%${i < segments.length - 1 ? " | " : ""}`}</text>
      ))}
    </box>
  );
};

const UsageMonitorStats = ({ children }: { children: ReactNode }) => (
  <box flexDirection="column">{children}</box>
);

const UsageMonitorStatRow = ({
  icon,
  label,
  value,
  valueSuffix,
  valueColor = "white",
}: UsageMonitorStatRowProps) => (
  <box flexDirection="row" gap={1}>
    {icon && <text>{icon}</text>}
    <text fg="#666">{label.padEnd(16)}</text>
    <text fg={valueColor}>{value}</text>
    {valueSuffix && <text>{` ${valueSuffix}`}</text>}
  </box>
);

const UsageMonitorPredictions = ({ children }: { children: ReactNode }) => (
  <box flexDirection="column">
    <text>
      <b>🔮 Predictions:</b>
    </text>
    <box flexDirection="column" paddingLeft={4}>
      {children}
    </box>
  </box>
);

const UsageMonitorPrediction = ({
  label,
  value,
  valueColor = "yellow",
}: UsageMonitorPredictionProps) => (
  <box flexDirection="row">
    <text fg="#666">{label.padEnd(24)}</text>
    <text fg={valueColor}>{value}</text>
  </box>
);

const UsageMonitorStatusBar = ({
  clock = false,
  clockColor,
  sessionLabel,
  sessionColor = "green",
  exitHint,
  statusDot: dot = "green",
  separator = " | ",
}: UsageMonitorStatusBarProps) => {
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 8));
  useEffect(() => {
    const id = setInterval(
      () => setTime(new Date().toTimeString().slice(0, 8)),
      1000
    );
    return () => clearInterval(id);
  }, []);

  const dotInfo = statusDotChar(dot);

  return (
    <box flexDirection="row" paddingTop={1}>
      {clock && <text fg={clockColor ?? "cyan"}>{`⏰ ${time}`}</text>}
      {sessionLabel && (
        <text fg={sessionColor}>{`${separator}📄 ${sessionLabel}`}</text>
      )}
      {exitHint && <text fg="#666">{`${separator}${exitHint}`}</text>}
      <text fg={dotInfo.color}>{`${separator}${dotInfo.char}`}</text>
    </box>
  );
};
UsageMonitorStatusBar.displayName = "UsageMonitor.StatusBar";

export const UsageMonitor = Object.assign(UsageMonitorRoot, {
  DistributionMetric: UsageMonitorDistributionMetric,
  Header: UsageMonitorHeader,
  Metric: UsageMonitorMetric,
  Prediction: UsageMonitorPrediction,
  Predictions: UsageMonitorPredictions,
  Section: UsageMonitorSection,
  StatRow: UsageMonitorStatRow,
  Stats: UsageMonitorStats,
  StatusBar: UsageMonitorStatusBar,
  Tags: UsageMonitorTags,
});
