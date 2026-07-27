import type { BoxProps } from "ink";

export type VisualAccessibilityProps =
  | { "aria-hidden": true; alt?: never }
  | { "aria-hidden"?: false; alt: string };

export interface AccessibleSeriesPoint {
  label?: string;
  value: number;
}

export const resolveBorderStyle = (
  borderStyle: BoxProps["borderStyle"],
  unicode: boolean
): BoxProps["borderStyle"] =>
  unicode || borderStyle === undefined ? borderStyle : "classic";

export const resolveTerminalSymbol = (
  unicode: boolean,
  unicodeSymbol: string,
  asciiSymbol: string
): string => (unicode ? unicodeSymbol : asciiSymbol);

export type TerminalStatus =
  | "error"
  | "info"
  | "neutral"
  | "pending"
  | "success"
  | "warning";

const unicodeStatusSymbols: Record<TerminalStatus, string> = {
  error: "✗",
  info: "ℹ",
  neutral: "·",
  pending: "○",
  success: "✓",
  warning: "⚠",
};

const asciiStatusSymbols: Record<TerminalStatus, string> = {
  error: "x",
  info: "i",
  neutral: "-",
  pending: "o",
  success: "v",
  warning: "!",
};

export const resolveStatusSymbol = (
  unicode: boolean,
  status: TerminalStatus
): string =>
  unicode ? unicodeStatusSymbols[status] : asciiStatusSymbols[status];

const asciiComponentCharacters: Readonly<Record<string, string>> = {
  "·": "-",
  "•": "*",
  "…": "...",
  "←": "<-",
  "↑": "^",
  "→": "->",
  "↓": "v",
  "↔": "<->",
  "─": "-",
  "━": "-",
  "│": "|",
  "┃": "|",
  "┌": "+",
  "┐": "+",
  "└": "+",
  "┘": "+",
  "├": "+",
  "┤": "+",
  "┬": "+",
  "┴": "+",
  "┼": "+",
  "═": "=",
  "║": "|",
  "╔": "+",
  "╗": "+",
  "╚": "+",
  "╝": "+",
  "╠": "+",
  "╣": "+",
  "╦": "+",
  "╩": "+",
  "╬": "+",
  "╭": "+",
  "╮": "+",
  "╯": "+",
  "╰": "+",
  "╱": "/",
  "╲": "\\",
  "▀": "#",
  "▄": "#",
  "█": "#",
  "░": ".",
  "▒": "+",
  "▓": "#",
  "■": "#",
  "□": "[ ]",
  "▪": "*",
  "◉": "*",
  "○": "o",
  "●": "o",
};

/** Convert only component-generated visual output; never pass consumer text. */
export const toAsciiComponentText = (value: string): string =>
  Array.from(
    value,
    (character) => asciiComponentCharacters[character] ?? character
  ).join("");

export const summarizeSeries = (
  label: string,
  points: readonly AccessibleSeriesPoint[],
  maximumPoints = 5
): string => {
  if (points.length === 0) {
    return `${label}: no data`;
  }

  const values = points.map(({ value }) => value);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const current = values.at(-1) ?? 0;
  const first = values[0] ?? current;
  let trend = "flat";
  if (current > first) {
    trend = "increasing";
  } else if (current < first) {
    trend = "decreasing";
  }
  const samples = points
    .slice(0, Math.max(0, maximumPoints))
    .map((point, index) => `${point.label ?? index + 1}: ${point.value}`)
    .join(", ");
  const omitted = Math.max(0, points.length - maximumPoints);

  return `${label}. Current ${current}. Range ${minimum} to ${maximum}. Trend ${trend}.${
    samples
      ? ` Values: ${samples}${omitted > 0 ? `, and ${omitted} more` : ""}.`
      : ""
  }`;
};
