import { Box, Text } from "ink";

import { useTheme } from "@/components/ui/ink-theme-provider";

export interface DividerProps {
  variant?: "single" | "double" | "bold";
  orientation?: "horizontal" | "vertical";
  color?: string;
  label?: string;
  labelColor?: string;
  dividerChar?: string;
  titlePadding?: number;
  padding?: number;
  height?: number;
  width?: number | "auto";
}

const DIVIDER_CHARS: Record<NonNullable<DividerProps["variant"]>, string> = {
  bold: "┃",
  double: "║",
  single: "│",
};

export const Divider = ({
  variant = "single",
  orientation = "horizontal",
  color,
  label,
  labelColor,
  dividerChar,
  titlePadding = 1,
  padding = 0,
  height = 1,
  width = "auto",
}: DividerProps) => {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.border;
  const vChar = dividerChar ?? DIVIDER_CHARS[variant];

  if (orientation === "vertical") {
    const lines = Array.from({ length: height }, (_, i) => i);
    return (
      <Box flexDirection="column">
        {lines.map((i) => (
          <Text key={i} color={resolvedColor}>
            {vChar}
          </Text>
        ))}
      </Box>
    );
  }

  const paddingStr = " ".repeat(padding);
  const titlePad = " ".repeat(titlePadding);

  if (label) {
    const resolvedLabelColor = labelColor ?? resolvedColor;
    return (
      <Box flexDirection="row" width={width === "auto" ? undefined : width}>
        {padding > 0 && <Text>{paddingStr}</Text>}
        <Box
          flexGrow={1}
          borderStyle="single"
          borderColor={resolvedColor}
          borderBottom={false}
          borderLeft={false}
          borderRight={false}
          borderTop
        />
        <Text color={resolvedLabelColor}>
          {titlePad}
          {label}
          {titlePad}
        </Text>
        <Box
          flexGrow={1}
          borderStyle="single"
          borderColor={resolvedColor}
          borderBottom={false}
          borderLeft={false}
          borderRight={false}
          borderTop
        />
        {padding > 0 && <Text>{paddingStr}</Text>}
      </Box>
    );
  }

  return (
    <Box flexDirection="row" width={width === "auto" ? undefined : width}>
      {padding > 0 && <Text>{paddingStr}</Text>}
      <Box
        flexGrow={1}
        borderStyle="single"
        borderColor={resolvedColor}
        borderBottom={false}
        borderLeft={false}
        borderRight={false}
        borderTop
      />
      {padding > 0 && <Text>{paddingStr}</Text>}
    </Box>
  );
};
