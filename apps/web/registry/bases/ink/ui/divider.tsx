import { Box, Text } from "ink";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

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
  "aria-label"?: string;
  "aria-hidden"?: boolean;
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
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden = !label,
}: DividerProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.border;
  const vChar = dividerChar ?? (unicode ? DIVIDER_CHARS[variant] : "|");

  if (orientation === "vertical") {
    const lines = Array.from({ length: height }, (_, i) => i);
    return (
      <Box
        flexDirection="column"
        aria-label={ariaHidden ? undefined : (ariaLabel ?? label)}
        aria-hidden={ariaHidden}
      >
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
      <Box
        flexDirection="row"
        width={width === "auto" ? undefined : width}
        aria-label={ariaHidden ? undefined : (ariaLabel ?? label)}
        aria-hidden={ariaHidden}
      >
        {padding > 0 && <Text>{paddingStr}</Text>}
        <Box
          flexGrow={1}
          borderStyle={resolveBorderStyle("single", unicode)}
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
          borderStyle={resolveBorderStyle("single", unicode)}
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
    <Box
      flexDirection="row"
      width={width === "auto" ? undefined : width}
      aria-label={ariaHidden ? undefined : ariaLabel}
      aria-hidden={ariaHidden}
    >
      {padding > 0 && <Text>{paddingStr}</Text>}
      <Box
        flexGrow={1}
        borderStyle={resolveBorderStyle("single", unicode)}
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
