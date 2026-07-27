import { Box, Text } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";

import { BigText } from "./big-text";

export type FigletFont = "block" | "simple";

export interface SplashScreenProps {
  title: string;
  font?: FigletFont;
  titleColor?: string;
  titleColorAlt?: string;
  bold?: boolean;
  subtitle?: string;
  subtitleDim?: boolean;
  author?: { name: string; href?: string };
  statusLine?: ReactNode;
  padding?: number;
  align?: "left" | "center";
}

const AltColorBigText = ({
  text,
  font,
  color,
  colorAlt,
}: {
  text: string;
  font: FigletFont;
  color: string;
  colorAlt: string;
}) => {
  const unicode = useUnicode();
  const onChar = unicode ? (font === "block" ? "█" : "▓") : "#";
  const offChar = " ";

  const FONT: Record<string, number[][]> = {
    " ": [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
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

  const FALLBACK: number[][] = [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
  ];

  const chars = [...text];
  const rows = 5;

  return (
    <Box flexDirection="column">
      {Array.from({ length: rows }, (_, rowIdx) => {
        const rowColor = rowIdx % 2 === 0 ? color : colorAlt;
        return (
          <Box key={rowIdx} flexDirection="row">
            {chars.map((ch, charIdx) => {
              const upper = ch.toUpperCase();
              const charRows = FONT[upper] ?? FONT[ch] ?? FALLBACK;
              const row = charRows[rowIdx] ?? [0, 0, 0];
              const rowStr = row
                .map((pixel) => (pixel ? onChar : offChar))
                .join("");
              return (
                <Text key={charIdx} color={rowColor}>
                  {`${rowStr} `}
                </Text>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
};

export const SplashScreen = ({
  title,
  font = "block",
  titleColor,
  titleColorAlt,
  bold: _bold = true,
  subtitle,
  subtitleDim = true,
  author,
  statusLine,
  padding = 2,
}: SplashScreenProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedTitleColor = titleColor ?? theme.colors.primary;

  const authorHref = author?.href
    ? `\u001B]8;;${author.href}\u001B\\${author.name}\u001B]8;;\u001B\\`
    : null;
  const authorNode = author ? (authorHref ?? author.name) : null;

  return (
    <Box flexDirection="column" paddingLeft={padding} aria-role="list">
      <Text
        aria-label={`${title}${subtitle ? `. ${subtitle}` : ""}${author ? `. By ${author.name}` : ""}`}
      >
        {""}
      </Text>
      {titleColorAlt ? (
        <AltColorBigText
          text={title}
          font={font}
          color={resolvedTitleColor}
          colorAlt={titleColorAlt}
        />
      ) : (
        <BigText font={font} color={resolvedTitleColor}>
          {title}
        </BigText>
      )}

      {subtitle && (
        <Box marginTop={1}>
          <Text dimColor={subtitleDim}>{subtitle}</Text>
        </Box>
      )}

      {authorNode && (
        <Box marginTop={1}>
          <Text dimColor>{unicode ? "Made with ♥ by " : "Made by "}</Text>
          <Text>{authorNode}</Text>
        </Box>
      )}

      {statusLine && <Box marginTop={1}>{statusLine}</Box>}
    </Box>
  );
};
