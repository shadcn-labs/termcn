import { Box, Text } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveTerminalSymbol } from "@/registry/bases/ink/lib/accessibility";

export type HeadingLevel = 1 | 2 | 3 | 4;

export interface HeadingProps {
  level?: HeadingLevel;
  children: ReactNode;
  color?: string;
  prefix1?: string;
  prefix2?: string;
  prefix3?: string;
  uppercase?: boolean;
  "aria-label"?: string;
}

export const Heading = ({
  level = 1,
  children,
  color,
  prefix1,
  prefix2,
  prefix3,
  uppercase = true,
  "aria-label": ariaLabel,
}: HeadingProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedColor = color ?? theme.colors.primary;
  const resolvedPrefix1 =
    prefix1 ?? resolveTerminalSymbol(unicode, "██ ", "## ");
  const resolvedPrefix2 = prefix2 ?? resolveTerminalSymbol(unicode, "▌ ", "| ");
  const resolvedPrefix3 = prefix3 ?? resolveTerminalSymbol(unicode, "› ", "> ");

  switch (level) {
    case 1: {
      return (
        <Box
          aria-label={
            ariaLabel ??
            (typeof children === "string"
              ? `Heading level 1: ${children}`
              : "Heading level 1")
          }
        >
          <Text aria-hidden color={resolvedColor} bold>
            {resolvedPrefix1}
          </Text>
          <Text color={resolvedColor} bold>
            {uppercase && typeof children === "string"
              ? children.toUpperCase()
              : children}
          </Text>
        </Box>
      );
    }

    case 2: {
      return (
        <Box
          aria-label={
            ariaLabel ??
            (typeof children === "string"
              ? `Heading level 2: ${children}`
              : "Heading level 2")
          }
        >
          <Text aria-hidden color={resolvedColor} bold>
            {resolvedPrefix2}
          </Text>
          <Text color={resolvedColor} bold>
            {children}
          </Text>
        </Box>
      );
    }

    case 3: {
      return (
        <Box
          aria-label={
            ariaLabel ??
            (typeof children === "string"
              ? `Heading level 3: ${children}`
              : "Heading level 3")
          }
        >
          <Text aria-hidden bold>
            {resolvedPrefix3}
          </Text>
          <Text bold>{children}</Text>
        </Box>
      );
    }

    case 4: {
      return (
        <Box
          aria-label={
            ariaLabel ??
            (typeof children === "string"
              ? `Heading level 4: ${children}`
              : "Heading level 4")
          }
        >
          <Text underline dimColor>
            {children}
          </Text>
        </Box>
      );
    }

    default: {
      return (
        <Box>
          <Text>{children}</Text>
        </Box>
      );
    }
  }
};
