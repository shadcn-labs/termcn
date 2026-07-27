import { Box, Text } from "ink";
import type { ReactNode } from "react";
import React from "react";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface WelcomeScreenProps {
  appName: string;
  appNameColor?: string;
  version?: string;
  borderColor?: string;
  borderStyle?: BorderStyle;
  leftWidth?: number;
  children: ReactNode;
}

export interface WelcomeScreenGreetingProps {
  children: ReactNode;
  bold?: boolean;
  align?: "left" | "center";
  color?: string;
}

export interface WelcomeScreenLogoProps {
  children: ReactNode;
  align?: "left" | "center";
}

export interface WelcomeScreenMetaProps {
  items: string[];
  separator?: string;
  align?: "left" | "center";
  dim?: boolean;
  color?: string;
  stack?: boolean;
}

export interface WelcomeScreenSectionProps {
  title: string;
  titleColor?: string;
  titleBold?: boolean;
  children: ReactNode;
}

const WelcomeScreenLeft = ({ children }: { children: ReactNode }) => children;
WelcomeScreenLeft.displayName = "WelcomeScreen.Left";

const WelcomeScreenRight = ({ children }: { children: ReactNode }) => children;
WelcomeScreenRight.displayName = "WelcomeScreen.Right";

const WelcomeScreenGreeting = ({
  children,
  bold: boldText = true,
  color,
}: WelcomeScreenGreetingProps) => (
  <Box paddingBottom={1}>
    <Text bold={boldText} color={color}>
      {children}
    </Text>
  </Box>
);

const WelcomeScreenLogo = ({
  children,
  align = "left",
}: WelcomeScreenLogoProps) => (
  <Box
    flexDirection="column"
    alignItems={align === "center" ? "center" : "flex-start"}
    paddingY={1}
  >
    {typeof children === "string"
      ? children.split("\n").map((line, i) => <Text key={i}>{line}</Text>)
      : children}
  </Box>
);

const WelcomeScreenMeta = ({
  items,
  separator,
  align = "center",
  dim = false,
  color,
  stack = false,
}: WelcomeScreenMetaProps) => {
  const unicode = useUnicode();
  const resolvedSeparator = separator ?? (unicode ? " · " : " - ");
  if (stack) {
    return (
      <Box
        flexDirection="column"
        alignItems={align === "center" ? "center" : "flex-start"}
        paddingTop={1}
      >
        {items.map((item, i) => (
          <Text key={i} dimColor={dim} color={color}>
            {item}
          </Text>
        ))}
      </Box>
    );
  }

  return (
    <Box
      flexDirection="row"
      flexWrap="wrap"
      justifyContent={align === "center" ? "center" : "flex-start"}
      paddingTop={1}
    >
      {items.map((item, i) => (
        <Text key={i} dimColor={dim} color={color}>
          {item}
          {i < items.length - 1 ? resolvedSeparator : ""}
        </Text>
      ))}
    </Box>
  );
};

const WelcomeScreenSection = ({
  title,
  titleColor,
  titleBold = true,
  children,
}: WelcomeScreenSectionProps) => {
  const theme = useTheme();
  return (
    <Box flexDirection="column" paddingBottom={1}>
      <Text bold={titleBold} color={titleColor ?? theme.colors.primary}>
        {title}
      </Text>
      <Text>{children}</Text>
    </Box>
  );
};

const WelcomeScreenRoot = ({
  appName,
  appNameColor,
  version,
  borderColor,
  borderStyle = "single",
  leftWidth = 26,
  children,
}: WelcomeScreenProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const resolvedBorderColor = borderColor ?? theme.colors.border;
  const resolvedAppNameColor = appNameColor ?? theme.colors.primary;

  const childArray = React.Children.toArray(children);
  const leftChildren = childArray.filter(
    (c) =>
      React.isValidElement(c) &&
      (c.type as { displayName?: string }).displayName === "WelcomeScreen.Left"
  );
  const rightChildren = childArray.filter(
    (c) =>
      React.isValidElement(c) &&
      (c.type as { displayName?: string }).displayName === "WelcomeScreen.Right"
  );

  const leftContent = leftChildren.flatMap((c) =>
    React.isValidElement(c)
      ? React.Children.toArray(
          (c.props as { children?: React.ReactNode }).children
        )
      : []
  );
  const rightContent = rightChildren.flatMap((c) =>
    React.isValidElement(c)
      ? React.Children.toArray(
          (c.props as { children?: React.ReactNode }).children
        )
      : []
  );

  const titleStr = version ? `${appName} ${version}` : appName;

  return (
    <Box flexDirection="column" aria-role="list">
      <Text aria-label={`Welcome to ${titleStr}`}>{""}</Text>
      <Box flexDirection="row">
        <Text color={resolvedBorderColor}>{unicode ? "── " : "-- "}</Text>
        <Text color={resolvedAppNameColor} bold>
          {titleStr}
        </Text>
        <Text color={resolvedBorderColor}>{unicode ? " ─" : " -"}</Text>
      </Box>
      <Box
        borderStyle={resolveBorderStyle(borderStyle, unicode)}
        borderColor={resolvedBorderColor}
        borderTop={false}
        flexDirection="row"
      >
        <Box width={leftWidth} flexDirection="column" paddingX={1} paddingY={1}>
          {leftContent}
        </Box>
        <Box width={1} flexDirection="column" alignItems="center">
          <Text color={resolvedBorderColor}>{unicode ? "│" : "|"}</Text>
        </Box>
        <Box flexGrow={1} flexDirection="column" paddingX={1} paddingY={1}>
          {rightContent}
        </Box>
      </Box>
    </Box>
  );
};

export const WelcomeScreen = Object.assign(WelcomeScreenRoot, {
  Greeting: WelcomeScreenGreeting,
  Left: WelcomeScreenLeft,
  Logo: WelcomeScreenLogo,
  Meta: WelcomeScreenMeta,
  Right: WelcomeScreenRight,
  Section: WelcomeScreenSection,
});
