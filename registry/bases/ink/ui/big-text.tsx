import { Box, Text } from "ink";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { toAsciiComponentText } from "@/registry/bases/ink/lib/accessibility";

export type BigTextFont = "block" | "simple" | "shade" | "slim";

export interface BigTextProps {
  children: string;
  color?: string;
  font?: BigTextFont;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
}

const FONT: Record<string, number[][]> = {
  " ": [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  "!": [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 0, 0],
    [0, 1, 0],
  ],
  "-": [
    [0, 0, 0],
    [0, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
    [0, 0, 0],
  ],
  ".": [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 1, 0],
  ],
  "0": [
    [0, 1, 0],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 0],
  ],
  "1": [
    [0, 1, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
  "2": [
    [1, 1, 0],
    [0, 0, 1],
    [0, 1, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
  "3": [
    [1, 1, 0],
    [0, 0, 1],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
  ],
  "4": [
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
  ],
  "5": [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
  ],
  "6": [
    [0, 1, 1],
    [1, 0, 0],
    [1, 1, 0],
    [1, 0, 1],
    [0, 1, 0],
  ],
  "7": [
    [1, 1, 1],
    [0, 0, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
  ],
  "8": [
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 0],
  ],
  "9": [
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 1],
    [0, 0, 1],
    [1, 1, 0],
  ],
  ":": [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ],
  "?": [
    [0, 1, 0],
    [1, 0, 1],
    [0, 0, 1],
    [0, 1, 0],
    [0, 1, 0],
  ],
  A: [
    [0, 1, 0],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
  ],
  B: [
    [1, 1, 0],
    [1, 0, 1],
    [1, 1, 0],
    [1, 0, 1],
    [1, 1, 0],
  ],
  C: [
    [0, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
    [1, 0, 0],
    [0, 1, 1],
  ],
  D: [
    [1, 1, 0],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 0],
  ],
  E: [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
  F: [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 0],
    [1, 0, 0],
    [1, 0, 0],
  ],
  G: [
    [0, 1, 1],
    [1, 0, 0],
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 1],
  ],
  H: [
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
  ],
  I: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
  J: [
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [1, 0, 1],
    [0, 1, 0],
  ],
  K: [
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 0],
    [1, 0, 1],
    [1, 0, 1],
  ],
  L: [
    [1, 0, 0],
    [1, 0, 0],
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
  M: [
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
  ],
  N: [
    [1, 0, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
  ],
  O: [
    [0, 1, 0],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 0],
  ],
  P: [
    [1, 1, 0],
    [1, 0, 1],
    [1, 1, 0],
    [1, 0, 0],
    [1, 0, 0],
  ],
  Q: [
    [0, 1, 0],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 1, 1],
  ],
  R: [
    [1, 1, 0],
    [1, 0, 1],
    [1, 1, 0],
    [1, 0, 1],
    [1, 0, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
  ],
  T: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
  ],
  U: [
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 0],
  ],
  V: [
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 0],
  ],
  W: [
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
  ],
  X: [
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1],
    [1, 0, 1],
  ],
  Y: [
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
  ],
  Z: [
    [1, 1, 1],
    [0, 0, 1],
    [0, 1, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
};

const SLIM_FONT: Record<string, string[]> = {
  " ": ["   ", "   ", "   "],
  "!": ["║", "║", "╩"],
  "-": ["   ", "═══", "   "],
  ".": ["  ", "  ", "╩ "],
  "0": ["╔═╗", "║ ║", "╚═╝"],
  "1": ["╗  ", "║  ", "╩  "],
  "2": ["══╗", "╔═╝", "╚══"],
  "3": ["══╗", " ═╣", "══╝"],
  "4": ["╦ ╦", "╚═╣", "  ╩"],
  "5": ["╔══", "╚═╗", "══╝"],
  "6": ["╔══", "╠═╗", "╚═╝"],
  "7": ["══╗", "  ║", "  ╩"],
  "8": ["╔═╗", "╠═╣", "╚═╝"],
  "9": ["╔═╗", "╚═╣", "══╝"],
  ":": [" ", "╥", "╨"],
  "?": ["╔═╗", " ╔╝", " ╩ "],
  A: ["╔═╗", "╠═╣", "╩ ╩"],
  B: ["╔╗ ", "╠╩╗", "╚═╝"],
  C: ["╔═╗", "║  ", "╚═╝"],
  D: ["╔╗ ", "║ ║", "╚═╝"],
  E: ["╔══", "╠═ ", "╚══"],
  F: ["╔══", "╠═ ", "╩  "],
  G: ["╔═╗", "║ ╦", "╚═╝"],
  H: ["╦ ╦", "╠═╣", "╩ ╩"],
  I: ["╦", "║", "╩"],
  J: ["  ╦", "  ║", "╚═╝"],
  K: ["╦╔╝", "╠╩╗", "╩ ╩"],
  L: ["╦  ", "║  ", "╚══"],
  M: ["╔╦╗", "║║║", "╩ ╩"],
  N: ["╔╗╗", "║║║", "╩╚╝"],
  O: ["╔═╗", "║ ║", "╚═╝"],
  P: ["╔═╗", "╠═╝", "╩  "],
  Q: ["╔═╗", "║ ║", "╚╦╝"],
  R: ["╔═╗", "╠╦╝", "╩╚╗"],
  S: ["╔═╗", "╚═╗", "╚═╝"],
  T: ["═╦═", " ║ ", " ╩ "],
  U: ["╦ ╦", "║ ║", "╚═╝"],
  V: ["╦ ╦", "╚╦╝", " ╩ "],
  W: ["╦ ╦", "║║║", "╚╩╝"],
  X: ["╦ ╦", " ╬ ", "╩ ╩"],
  Y: ["╦ ╦", " ╦ ", " ╩ "],
  Z: ["══╦", "╔═╝", "╚══"],
};

const FALLBACK: number[][] = [
  [1, 1, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
];

const getCharRows = (ch: string): number[][] => {
  const upper = ch.toUpperCase();
  return FONT[upper] ?? FONT[ch] ?? FALLBACK;
};

const SHADE_CHARS: Record<number, string> = {
  0: " ",
  1: "░",
  2: "▒",
  3: "▓",
  4: "█",
};

const renderShadeRow = (row: number[]): string =>
  row.map((p) => (p ? (SHADE_CHARS[3] ?? "▓") : " ")).join("");

export const BigText = ({
  children,
  color,
  font = "block",
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
}: BigTextProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedColor = color ?? theme.colors.primary;

  const chars = [...children];

  if (font === "slim") {
    const rowCount = 3;
    return (
      <Box
        flexDirection="column"
        aria-label={ariaHidden ? undefined : (ariaLabel ?? children)}
        aria-hidden={ariaHidden}
      >
        {Array.from({ length: rowCount }, (_, rowIdx) => (
          <Box key={rowIdx} flexDirection="row">
            {chars.map((ch, charIdx) => {
              const upper = ch.toUpperCase();
              const slimChar = SLIM_FONT[upper] ?? SLIM_FONT[ch];
              const line = slimChar ? (slimChar[rowIdx] ?? "   ") : "   ";
              return (
                <Text key={charIdx} color={resolvedColor}>
                  {`${unicode ? line : toAsciiComponentText(line)} `}
                </Text>
              );
            })}
          </Box>
        ))}
      </Box>
    );
  }

  let onChar = "▓";
  if (font === "block") {
    onChar = "█";
  }
  const offChar = " ";
  const rows = 5;

  return (
    <Box
      flexDirection="column"
      aria-label={ariaHidden ? undefined : (ariaLabel ?? children)}
      aria-hidden={ariaHidden}
    >
      {Array.from({ length: rows }, (_, rowIdx) => (
        <Box key={rowIdx} flexDirection="row">
          {chars.map((ch, charIdx) => {
            const charRows = getCharRows(ch);
            const row = charRows[rowIdx] ?? [0, 0, 0];
            const rowStr =
              font === "shade"
                ? renderShadeRow(row)
                : row.map((pixel) => (pixel ? onChar : offChar)).join("");
            return (
              <Text key={charIdx} color={resolvedColor}>
                {`${unicode ? rowStr : toAsciiComponentText(rowStr)} `}
              </Text>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};
