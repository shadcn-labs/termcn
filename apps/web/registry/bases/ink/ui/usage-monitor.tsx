import { Box, Text } from "ink";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useInterval } from "@/hooks/use-interval";

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
  segments: { label: string; percent: number; color?: string }[];
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
): { current: string; maxStr: string } => {
  if (format === "custom" && formatFn) {
    const result = formatFn(value, max);
    return { current: result, maxStr: "" };
  }
  switch (format) {
    case "currency": {
      return { current: `$${value.toFixed(2)}`, maxStr: `$${max.toFixed(2)}` };
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
      return { current: `${value.toFixed(1)}%`, maxStr: `${max.toFixed(1)}%` };
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
  useInterval(() => setTick((t) => t + 1), refreshInterval);

  return (
    <Box flexDirection="column">
      {React.Children.map(children, (child, i) => (
        <React.Fragment key={i}>
          {child}
          {i < React.Children.count(children) - 1 &&
            React.isValidElement(child) &&
            (child.type as unknown as { displayName?: string }).displayName !==
              "UsageMonitor.StatusBar" && (
              <Text dimColor>{separatorChar.repeat(44)}</Text>
            )}
        </React.Fragment>
      ))}
    </Box>
  );
};

const UsageMonitorHeader = ({
  title,
  titleColor = "cyan",
  decorator = "◆ ✦ ◆ ✦",
  separatorChar = "═",
  separatorColor,
}: UsageMonitorHeaderProps) => (
  <Box flexDirection="column">
    <Box flexDirection="row" justifyContent="center">
      <Text dimColor>{`${decorator}  `}</Text>
      <Text color={titleColor} bold>
        {title}
      </Text>
      <Text dimColor>{`  ${decorator}`}</Text>
    </Box>
    <Text color={separatorColor} dimColor={!separatorColor}>
      {separatorChar.repeat(44)}
    </Text>
  </Box>
);
UsageMonitorHeader.displayName = "UsageMonitor.Header";

const UsageMonitorTags = ({
  items,
  bracketColor,
  separatorColor,
}: UsageMonitorTagsProps) => (
  <Box flexDirection="row" marginBottom={1}>
    <Text color={bracketColor ?? "cyan"}>{"[ "}</Text>
    {items.map((item, i) => (
      <React.Fragment key={i}>
        <Text>{item}</Text>
        {i < items.length - 1 && (
          <Text color={separatorColor ?? "cyan"}>{" | "}</Text>
        )}
      </React.Fragment>
    ))}
    <Text color={bracketColor ?? "cyan"}>{" ]"}</Text>
  </Box>
);

const UsageMonitorSection = ({
  icon,
  title,
  subtitle,
  children,
}: UsageMonitorSectionProps) => (
  <Box flexDirection="column" marginBottom={1}>
    {(icon || title) && (
      <Box flexDirection="row" gap={1}>
        {icon && <Text>{icon}</Text>}
        {title && <Text bold>{title}</Text>}
      </Box>
    )}
    {subtitle && <Text dimColor>{`    ${subtitle}`}</Text>}
    <Box flexDirection="column" paddingTop={1}>
      {children}
    </Box>
  </Box>
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
    <Box flexDirection="row" gap={1}>
      {icon && <Text>{icon}</Text>}
      <Text dimColor>{label.padEnd(16)}</Text>
      <Text color={dot.color}>{dot.char}</Text>
      <Text color={barColor}>{`[${bar}]`}</Text>
      <Text>{` ${percent.toFixed(1)}%`}</Text>
      <Text>{` ${current}`}</Text>
      {showMax && maxStr && <Text dimColor={maxDim}>{`/ ${maxStr}`}</Text>}
    </Box>
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
    <Box flexDirection="row" gap={1}>
      {icon && <Text>{icon}</Text>}
      <Text dimColor>{label.padEnd(16)}</Text>
      <Text>[</Text>
      {bars.map((seg, i) => (
        <Text key={i} color={seg.color ?? "white"}>
          {"█".repeat(seg.count)}
        </Text>
      ))}
      <Text>]</Text>
      {segments.map((seg, i) => (
        <Text key={i} color={seg.color ?? "white"}>
          {`${seg.label} ${seg.percent}%`}
          {i < segments.length - 1 ? " | " : ""}
        </Text>
      ))}
    </Box>
  );
};

const UsageMonitorStats = ({ children }: { children: ReactNode }) => (
  <Box flexDirection="column">{children}</Box>
);

const UsageMonitorStatRow = ({
  icon,
  label,
  value,
  valueSuffix,
  valueColor = "white",
}: UsageMonitorStatRowProps) => (
  <Box flexDirection="row" gap={1}>
    {icon && <Text>{icon}</Text>}
    <Text dimColor>{label.padEnd(16)}</Text>
    <Text color={valueColor}>{value}</Text>
    {valueSuffix && <Text>{` ${valueSuffix}`}</Text>}
  </Box>
);

const UsageMonitorPredictions = ({ children }: { children: ReactNode }) => (
  <Box flexDirection="column">
    <Text bold>🔮 Predictions:</Text>
    <Box flexDirection="column" paddingLeft={4}>
      {children}
    </Box>
  </Box>
);

const UsageMonitorPrediction = ({
  label,
  value,
  valueColor = "yellow",
}: UsageMonitorPredictionProps) => (
  <Box flexDirection="row">
    <Text dimColor>{label.padEnd(24)}</Text>
    <Text color={valueColor}>{value}</Text>
  </Box>
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
  useInterval(() => setTime(new Date().toTimeString().slice(0, 8)), 1000);

  const dotInfo = statusDotChar(dot);

  return (
    <Box flexDirection="row" paddingTop={1}>
      {clock && <Text color={clockColor ?? "cyan"}>{`⏰ ${time}`}</Text>}
      {sessionLabel && (
        <Text color={sessionColor}>{`${separator}📄 ${sessionLabel}`}</Text>
      )}
      {exitHint && <Text dimColor>{`${separator}${exitHint}`}</Text>}
      <Text color={dotInfo.color}>{`${separator}${dotInfo.char}`}</Text>
    </Box>
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
