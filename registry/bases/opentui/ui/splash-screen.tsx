/* @jsxImportSource @opentui/react */
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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
  author?: {
    name: string;
    href?: string;
  };
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
  const onChar = font === "block" ? "█" : "▓";
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
    <box flexDirection="column">
      {Array.from({ length: rows }, (_, rowIdx) => {
        const rowColor = rowIdx % 2 === 0 ? color : colorAlt;
        return (
          <box key={rowIdx} flexDirection="row">
            {chars.map((ch, charIdx) => {
              const upper = ch.toUpperCase();
              const charRows = FONT[upper] ?? FONT[ch] ?? FALLBACK;
              const row = charRows[rowIdx] ?? [0, 0, 0];
              const rowStr = row
                .map((pixel) => (pixel ? onChar : offChar))
                .join("");
              return <text key={charIdx} fg={rowColor}>{`${rowStr} `}</text>;
            })}
          </box>
        );
      })}
    </box>
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
  const resolvedTitleColor = titleColor ?? theme.colors.primary;

  const authorHref = author?.href
    ? `\u001B]8;;${author.href}\u001B\\${author.name}\u001B]8;;\u001B\\`
    : null;
  const authorNode = author ? (authorHref ?? author.name) : null;

  return (
    <box flexDirection="column" paddingLeft={padding}>
      {titleColorAlt ? (
        <AltColorBigText
          color={resolvedTitleColor}
          colorAlt={titleColorAlt}
          font={font}
          text={title}
        />
      ) : (
        <BigText color={resolvedTitleColor}>{title}</BigText>
      )}

      {subtitle && (
        <box marginTop={1}>
          <text fg={subtitleDim ? "#666" : undefined}>{subtitle}</text>
        </box>
      )}

      {authorNode && (
        <box marginTop={1}>
          <text fg="#666">{"Made with ♥ by "}</text>
          <text>{authorNode}</text>
        </box>
      )}

      {statusLine && <box marginTop={1}>{statusLine}</box>}
    </box>
  );
};
