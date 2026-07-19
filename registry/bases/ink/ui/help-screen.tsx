import { Box, Text } from "ink";
import type { ReactNode } from "react";
import React from "react";

import { useTheme } from "@/hooks/use-theme";
import {
  padToTerminalWidth,
  terminalWidth,
} from "@/registry/bases/ink/lib/terminal-text";

import { BigText } from "./big-text";
import type { BigTextFont } from "./big-text";

export interface HelpScreenProps {
  title: string;
  font?: BigTextFont;
  titleColor?: string;
  tagline?: string;
  usage?: string;
  description?: string;
  columnGap?: number;
  flagWidth?: number;
  children: ReactNode;
}

export interface HelpScreenSectionProps {
  label: string;
  labelColor?: string;
  children: ReactNode;
}

export interface HelpScreenRowProps {
  flag: string;
  description: string;
  flagColor?: string;
  descriptionColor?: string;
}

const computeFlagWidth = (children: ReactNode): number => {
  let max = 0;
  React.Children.forEach(children, (section) => {
    if (React.isValidElement(section)) {
      React.Children.forEach(
        (section.props as { children?: ReactNode }).children,
        (row) => {
          const rowProps = React.isValidElement(row)
            ? (row.props as Record<string, unknown>)
            : null;
          if (rowProps && rowProps["flag"]) {
            max = Math.max(max, terminalWidth(String(rowProps["flag"])));
          }
        }
      );
    }
  });
  return max;
};

const HelpScreenRoot = ({
  title,
  font = "block",
  titleColor,
  tagline,
  usage,
  description,
  columnGap = 4,
  flagWidth,
  children,
}: HelpScreenProps) => {
  const theme = useTheme();
  const resolvedColor = titleColor ?? theme.colors.primary;

  const resolvedFlagWidth = flagWidth ?? computeFlagWidth(children);

  const enrichedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(
        child as React.ReactElement<Record<string, unknown>>,
        {
          _columnGap: columnGap,
          _flagWidth: resolvedFlagWidth,
        }
      );
    }
    return child;
  });

  return (
    <Box flexDirection="column" paddingLeft={2} aria-role="list">
      <Text
        aria-label={`Help: ${title}${tagline ? `. ${tagline}` : ""}${usage ? `. Usage: ${usage}` : ""}`}
      >
        {""}
      </Text>
      <Box marginBottom={1}>
        <BigText font={font} color={resolvedColor}>
          {title}
        </BigText>
      </Box>

      {tagline && (
        <Box marginBottom={1}>
          <Text dimColor>{tagline}</Text>
        </Box>
      )}

      {usage && (
        <Box marginBottom={1}>
          <Text>
            <Text dimColor>{"Usage: "}</Text>
            {usage}
          </Text>
        </Box>
      )}

      {description && (
        <Box marginBottom={1}>
          <Text>{description}</Text>
        </Box>
      )}

      {enrichedChildren}
    </Box>
  );
};

const HelpScreenSection = ({
  label,
  labelColor,
  children,
  _flagWidth = 20,
  _columnGap = 4,
}: HelpScreenSectionProps & { _flagWidth?: number; _columnGap?: number }) => {
  const theme = useTheme();

  const enrichedRows = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(
        child as React.ReactElement<Record<string, unknown>>,
        {
          _columnGap,
          _flagWidth,
        }
      );
    }
    return child;
  });

  return (
    <Box flexDirection="column" marginBottom={1} aria-role="listitem">
      <Text aria-label={`Section: ${label}`}>{""}</Text>
      <Text bold color={labelColor ?? theme.colors.foreground}>
        {label}
      </Text>
      {enrichedRows}
    </Box>
  );
};

const HelpScreenRow = ({
  flag,
  description,
  flagColor,
  descriptionColor,
  _flagWidth = 20,
  _columnGap = 4,
}: HelpScreenRowProps & { _flagWidth?: number; _columnGap?: number }) => {
  const theme = useTheme();
  const paddedFlag = padToTerminalWidth(flag, _flagWidth + _columnGap);

  return (
    <Box
      flexDirection="row"
      paddingLeft={2}
      aria-label={`${flag}: ${description}`}
    >
      <Text color={flagColor ?? theme.colors.mutedForeground}>
        {paddedFlag}
      </Text>
      <Text color={descriptionColor}>{description}</Text>
    </Box>
  );
};

export const HelpScreen = Object.assign(HelpScreenRoot, {
  Row: HelpScreenRow,
  Section: HelpScreenSection,
});
