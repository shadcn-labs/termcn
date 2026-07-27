/* @jsxImportSource @opentui/react */

import { useTheme } from "@/components/ui/opentui-theme-provider";

export type DigitSize = "sm" | "md" | "lg";

export interface DigitsProps {
  value: string | number;
  color?: string;
  size?: DigitSize;
}

const SEGMENTS_MD: Record<string, string[]> = {
  " ": ["   ", "   ", "   ", "   ", "   "],
  "-": ["   ", "   ", " ─ ", "   ", "   "],
  ".": ["   ", "   ", "   ", "   ", " ● "],
  "0": ["╭─╮", "│ │", "│ │", "│ │", "╰─╯"],
  "1": ["  │", "  │", "  │", "  │", "  │"],
  "2": ["╭─╮", "  │", "╭─╯", "│  ", "╰─╴"],
  "3": ["╭─╮", "  │", " ─┤", "  │", "╰─╯"],
  "4": ["╷ ╷", "│ │", "╰─┤", "  │", "  ╵"],
  "5": ["╭─╴", "│  ", "╰─╮", "  │", "╰─╯"],
  "6": ["╭─╴", "│  ", "├─╮", "│ │", "╰─╯"],
  "7": ["╭─╮", "  │", "  │", "  │", "  ╵"],
  "8": ["╭─╮", "│ │", "├─┤", "│ │", "╰─╯"],
  "9": ["╭─╮", "│ │", "╰─┤", "  │", "╰─╯"],
  ":": ["   ", " ● ", "   ", " ● ", "   "],
};

const SEGMENTS_LG: Record<string, string[]> = {
  " ": ["     ", "     ", "     ", "     ", "     "],
  "-": ["     ", "     ", " ─── ", "     ", "     "],
  ".": ["     ", "     ", "     ", "     ", "  ●  "],
  "0": ["╭───╮", "│   │", "│   │", "│   │", "╰───╯"],
  "1": ["   ╷ ", "   │ ", "   │ ", "   │ ", "   ╵ "],
  "2": ["╭───╮", "    │", " ───╯", "│    ", "╰───╴"],
  "3": ["╭───╮", "    │", " ───┤", "    │", "╰───╯"],
  "4": ["╷   ╷", "│   │", "╰───┤", "    │", "    ╵"],
  "5": ["╭───╴", "│    ", "╰───╮", "    │", "╰───╯"],
  "6": ["╭───╴", "│    ", "├───╮", "│   │", "╰───╯"],
  "7": ["╭───╮", "    │", "    │", "    │", "    ╵"],
  "8": ["╭───╮", "│   │", "├───┤", "│   │", "╰───╯"],
  "9": ["╭───╮", "│   │", "╰───┤", "    │", "╰───╯"],
  ":": ["     ", "  ●  ", "     ", "  ●  ", "     "],
};

const getSegmentMap = (size: DigitSize): Record<string, string[]> =>
  size === "lg" ? SEGMENTS_LG : SEGMENTS_MD;

const getFallback = (size: DigitSize): string[] => {
  const w = size === "lg" ? 5 : 3;
  const bar = "─".repeat(w - 2);
  const side = `│${" ".repeat(w - 2)}│`;
  return [`╭${bar}╮`, side, side, side, `╰${bar}╯`];
};

export const Digits = ({ value, color, size = "md" }: DigitsProps) => {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.primary;
  const str = String(value);

  if (size === "sm") {
    return (
      <text fg={resolvedColor}>
        <b>{str}</b>
      </text>
    );
  }

  const segMap = getSegmentMap(size);
  const fallback = getFallback(size);
  const chars = [...str];
  const rows = 5;

  return (
    <box flexDirection="column">
      {Array.from({ length: rows }, (_, rowIdx) => (
        <box key={rowIdx} flexDirection="row">
          {chars.map((ch, charIdx) => {
            const segments = segMap[ch] ?? fallback;
            const rowStr =
              segments[rowIdx] ?? " ".repeat(size === "lg" ? 5 : 3);
            return <text key={charIdx} fg={resolvedColor}>{`${rowStr} `}</text>;
          })}
        </box>
      ))}
    </box>
  );
};
