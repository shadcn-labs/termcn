import { Box, Text } from "ink";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useInterval } from "@/hooks/use-interval";
import { useUnicode } from "@/hooks/use-unicode";

export interface UsageMonitorProps {
  refreshInterval?: number;
  separatorChar?: string;
  children: ReactNode;
  isActive?: boolean;
  "aria-label"?: string;
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
  status: "green" | "yellow" | "red",
  unicode: boolean
): {
  char: string;
  color: string;
} => {
  switch (status) {
    case "green": {
      return { char: unicode ? "●" : "o", color: "green" };
    }
    case "yellow": {
      return { char: unicode ? "◕" : "!", color: "yellow" };
    }
    case "red": {
      return { char: unicode ? "○" : "x", color: "red" };
    }
    default: {
      return { char: unicode ? "●" : "o", color: "green" };
    }
  }
};

const UsageMonitorRoot = ({
  refreshInterval = 1000,
  separatorChar,
  children,
  isActive = true,
  "aria-label": ariaLabel = "Usage monitor",
}: UsageMonitorProps) => {
  const unicode = useUnicode();
  const resolvedSeparatorChar = separatorChar ?? (unicode ? "─" : "-");
  const [, setTick] = useState(0);
  useInterval(() => setTick((t) => t + 1), refreshInterval, { isActive });

  return (
    <Box flexDirection="column" aria-role="list">
      <Text aria-label={ariaLabel}>{""}</Text>
      {React.Children.map(children, (child, i) => (
        <React.Fragment key={i}>
          {child}
          {i < React.Children.count(children) - 1 &&
            React.isValidElement(child) &&
            (child.type as unknown as { displayName?: string }).displayName !==
              "UsageMonitor.StatusBar" && (
              <Text aria-hidden dimColor>
                {resolvedSeparatorChar.repeat(44)}
              </Text>
            )}
        </React.Fragment>
      ))}
    </Box>
  );
};

const UsageMonitorHeader = ({
  title,
  titleColor = "cyan",
  decorator,
  separatorChar,
  separatorColor,
}: UsageMonitorHeaderProps) => {
  const unicode = useUnicode();
  const resolvedDecorator = decorator ?? (unicode ? "◆ ✦ ◆ ✦" : "* + * +");
  const resolvedSeparatorChar = separatorChar ?? (unicode ? "═" : "=");
  return (
    <Box flexDirection="column">
      <Box flexDirection="row" justifyContent="center">
        <Text dimColor>{`${resolvedDecorator}  `}</Text>
        <Text color={titleColor} bold>
          {title}
        </Text>
        <Text dimColor>{`  ${resolvedDecorator}`}</Text>
      </Box>
      <Text color={separatorColor} dimColor={!separatorColor}>
        {resolvedSeparatorChar.repeat(44)}
      </Text>
    </Box>
  );
};
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
  barFillChar,
  barEmptyChar,
  barColor = "white",
  maxDim = false,
  showMax = true,
}: UsageMonitorMetricProps) => {
  const unicode = useUnicode();
  const resolvedBarFillChar = barFillChar ?? (unicode ? "█" : "#");
  const resolvedBarEmptyChar = barEmptyChar ?? (unicode ? "░" : ".");
  const normalizedPercent = Math.max(0, Math.min(100, percent));
  const filled = Math.round((normalizedPercent / 100) * barWidth);
  const empty = barWidth - filled;
  const bar =
    resolvedBarFillChar.repeat(filled) + resolvedBarEmptyChar.repeat(empty);
  const dot = statusDotChar(status as "green" | "yellow" | "red", unicode);
  const { current, maxStr } = formatValue(value, max, format, formatFn);

  return (
    <Box
      flexDirection="row"
      gap={1}
      aria-role="progressbar"
      aria-label={`${label}: ${normalizedPercent.toFixed(1)}%, ${current}${showMax && maxStr ? ` of ${maxStr}` : ""}, status ${status}.`}
      aria-state={{ busy: normalizedPercent < 100 }}
    >
      {icon && <Text>{icon}</Text>}
      <Text dimColor>{label.padEnd(16)}</Text>
      <Text aria-hidden color={dot.color}>
        {dot.char}
      </Text>
      <Text aria-hidden color={barColor}>{`[${bar}]`}</Text>
      <Text>{` ${normalizedPercent.toFixed(1)}%`}</Text>
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
  const unicode = useUnicode();
  const bars = segments.map((seg) => {
    const count = Math.round((seg.percent / 100) * barWidth);
    return { ...seg, count };
  });

  return (
    <Box
      flexDirection="row"
      gap={1}
      aria-role="listitem"
      aria-label={`${label}: ${segments.map((segment) => `${segment.label} ${segment.percent}%`).join(", ")}`}
    >
      {icon && <Text>{icon}</Text>}
      <Text dimColor>{label.padEnd(16)}</Text>
      <Text>[</Text>
      {bars.map((seg, i) => (
        <Text key={i} color={seg.color ?? "white"}>
          {(unicode ? "█" : "#").repeat(seg.count)}
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
  <Box flexDirection="column" aria-role="list">
    {children}
  </Box>
);

const UsageMonitorStatRow = ({
  icon,
  label,
  value,
  valueSuffix,
  valueColor = "white",
}: UsageMonitorStatRowProps) => (
  <Box
    flexDirection="row"
    gap={1}
    aria-role="listitem"
    aria-label={`${label}: ${value}${valueSuffix ? ` ${valueSuffix}` : ""}`}
  >
    {icon && <Text>{icon}</Text>}
    <Text dimColor>{label.padEnd(16)}</Text>
    <Text color={valueColor}>{value}</Text>
    {valueSuffix && <Text>{` ${valueSuffix}`}</Text>}
  </Box>
);

const UsageMonitorPredictions = ({ children }: { children: ReactNode }) => {
  const unicode = useUnicode();
  return (
    <Box flexDirection="column">
      <Text bold>{unicode ? "🔮 Predictions:" : "Predictions:"}</Text>
      <Box flexDirection="column" paddingLeft={4}>
        {children}
      </Box>
    </Box>
  );
};

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
  const unicode = useUnicode();
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 8));
  useInterval(() => setTime(new Date().toTimeString().slice(0, 8)), 1000);

  const dotInfo = statusDotChar(dot, unicode);

  return (
    <Box flexDirection="row" paddingTop={1}>
      {clock && (
        <Text color={clockColor ?? "cyan"}>
          {unicode ? `⏰ ${time}` : `time ${time}`}
        </Text>
      )}
      {sessionLabel && (
        <Text color={sessionColor}>
          {unicode
            ? `${separator}📄 ${sessionLabel}`
            : `${separator}session ${sessionLabel}`}
        </Text>
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
