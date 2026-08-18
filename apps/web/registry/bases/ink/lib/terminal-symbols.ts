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

export const toAsciiComponentText = (value: string): string =>
  Array.from(
    value,
    (character) => asciiComponentCharacters[character] ?? character
  ).join("");
