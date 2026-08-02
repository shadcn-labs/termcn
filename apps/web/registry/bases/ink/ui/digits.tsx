import { Box, Text } from "ink";

import { useTheme } from "@/registry/bases/ink/hooks/use-theme";
import { useUnicode } from "@/registry/bases/ink/hooks/use-unicode";
import { toAsciiComponentText } from "@/registry/bases/ink/lib/accessibility";

export type DigitSize = "sm" | "md" | "lg";

export interface DigitsProps {
  value: string | number;
  color?: string;
  size?: DigitSize;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
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

export const Digits = ({
  value,
  color,
  size = "md",
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
}: DigitsProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedColor = color ?? theme.colors.primary;
  const str = String(value);

  if (size === "sm") {
    return (
      <Text
        aria-label={ariaHidden ? undefined : (ariaLabel ?? str)}
        aria-hidden={ariaHidden}
        color={resolvedColor}
        bold
      >
        {str}
      </Text>
    );
  }

  const segMap = getSegmentMap(size);
  const fallback = getFallback(size);
  const chars = [...str];
  const rows = 5;

  return (
    <Box
      flexDirection="column"
      aria-label={ariaHidden ? undefined : (ariaLabel ?? str)}
      aria-hidden={ariaHidden}
    >
      {Array.from({ length: rows }, (_, rowIdx) => (
        <Box key={rowIdx} flexDirection="row">
          {chars.map((ch, charIdx) => {
            const segments = segMap[ch] ?? fallback;
            const rowStr =
              segments[rowIdx] ?? " ".repeat(size === "lg" ? 5 : 3);
            return (
              <Text key={charIdx} color={resolvedColor}>
                {unicode ? rowStr : toAsciiComponentText(rowStr)}{" "}
              </Text>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};
