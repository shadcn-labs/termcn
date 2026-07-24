/* @jsxImportSource @opentui/react */
import React from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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
        (
          section.props as {
            children?: ReactNode;
          }
        ).children,
        (row) => {
          const rowProps = React.isValidElement(row)
            ? (row.props as Record<string, unknown>)
            : null;
          if (rowProps && rowProps["flag"]) {
            max = Math.max(max, String(rowProps["flag"]).length);
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
    <box flexDirection="column" paddingLeft={2}>
      <box marginBottom={1}>
        <BigText font={font} color={resolvedColor}>
          {title}
        </BigText>
      </box>

      {tagline && (
        <box marginBottom={1}>
          <text fg="#666">{tagline}</text>
        </box>
      )}

      {usage && (
        <box marginBottom={1}>
          <text fg="#666">{"Usage: "}</text>
          <text>{usage}</text>
        </box>
      )}

      {description && (
        <box marginBottom={1}>
          <text>{description}</text>
        </box>
      )}

      {enrichedChildren}
    </box>
  );
};

const HelpScreenSection = ({
  label,
  labelColor,
  children,
  _flagWidth = 20,
  _columnGap = 4,
}: HelpScreenSectionProps & {
  _flagWidth?: number;
  _columnGap?: number;
}) => {
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
    <box flexDirection="column" marginBottom={1}>
      <text fg={labelColor ?? theme.colors.foreground}>
        <b>{label}</b>
      </text>
      {enrichedRows}
    </box>
  );
};

const HelpScreenRow = ({
  flag,
  description,
  flagColor,
  descriptionColor,
  _flagWidth = 20,
  _columnGap = 4,
}: HelpScreenRowProps & {
  _flagWidth?: number;
  _columnGap?: number;
}) => {
  const theme = useTheme();
  const paddedFlag = flag.padEnd(_flagWidth + _columnGap);

  return (
    <box flexDirection="row" paddingLeft={2}>
      <text fg={flagColor ?? theme.colors.mutedForeground}>{paddedFlag}</text>
      <text fg={descriptionColor}>{description}</text>
    </box>
  );
};

export const HelpScreen = Object.assign(HelpScreenRoot, {
  Row: HelpScreenRow,
  Section: HelpScreenSection,
});
