/* @jsxImportSource @opentui/react */
import React from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import type { BorderStyle } from "@/registry/bases/opentui/ui/types";

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
  <box paddingBottom={1}>
    <text fg={color}>{boldText ? <b>{children}</b> : children}</text>
  </box>
);

const WelcomeScreenLogo = ({
  children,
  align = "left",
}: WelcomeScreenLogoProps) => (
  <box
    flexDirection="column"
    alignItems={align === "center" ? "center" : "flex-start"}
    paddingTop={1}
    paddingBottom={1}
  >
    {typeof children === "string"
      ? children.split("\n").map((line, i) => <text key={i}>{line}</text>)
      : children}
  </box>
);

const WelcomeScreenMeta = ({
  items,
  separator = " · ",
  align = "center",
  dim = false,
  color,
  stack = false,
}: WelcomeScreenMetaProps) => {
  if (stack) {
    return (
      <box
        flexDirection="column"
        alignItems={align === "center" ? "center" : "flex-start"}
        paddingTop={1}
      >
        {items.map((item, i) => (
          <text key={i} fg={dim ? "#666" : color}>
            {item}
          </text>
        ))}
      </box>
    );
  }

  return (
    <box
      flexDirection="row"
      flexWrap="wrap"
      justifyContent={align === "center" ? "center" : "flex-start"}
      paddingTop={1}
    >
      {items.map((item, i) => (
        <text
          key={i}
          fg={dim ? "#666" : color}
        >{`${item}${i < items.length - 1 ? separator : ""}`}</text>
      ))}
    </box>
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
    <box flexDirection="column" paddingBottom={1}>
      <text fg={titleColor ?? theme.colors.primary}>
        {titleBold ? <b>{title}</b> : title}
      </text>
      <text>{children}</text>
    </box>
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
  const theme = useTheme();
  const resolvedBorderColor = borderColor ?? theme.colors.border;
  const resolvedAppNameColor = appNameColor ?? theme.colors.primary;

  const childArray = React.Children.toArray(children);
  const leftChildren = childArray.filter(
    (c) =>
      React.isValidElement(c) &&
      (
        c.type as {
          displayName?: string;
        }
      ).displayName === "WelcomeScreen.Left"
  );
  const rightChildren = childArray.filter(
    (c) =>
      React.isValidElement(c) &&
      (
        c.type as {
          displayName?: string;
        }
      ).displayName === "WelcomeScreen.Right"
  );

  const leftContent = leftChildren.flatMap((c) =>
    React.isValidElement(c)
      ? React.Children.toArray(
          (
            c.props as {
              children?: React.ReactNode;
            }
          ).children
        )
      : []
  );
  const rightContent = rightChildren.flatMap((c) =>
    React.isValidElement(c)
      ? React.Children.toArray(
          (
            c.props as {
              children?: React.ReactNode;
            }
          ).children
        )
      : []
  );

  const titleStr = version ? `${appName} ${version}` : appName;

  return (
    <box flexDirection="column">
      <box flexDirection="row">
        <text fg={resolvedBorderColor}>{"── "}</text>
        <text fg={resolvedAppNameColor}>
          <b>{titleStr}</b>
        </text>
        <text fg={resolvedBorderColor}>{" ─"}</text>
      </box>
      <box
        borderColor={resolvedBorderColor}
        borderTop={false}
        flexDirection="row"
      >
        <box
          width={leftWidth}
          flexDirection="column"
          paddingLeft={1}
          paddingRight={1}
          paddingTop={1}
          paddingBottom={1}
        >
          {...leftContent}
        </box>
        <box width={1} flexDirection="column" alignItems="center">
          <text fg={resolvedBorderColor}>│</text>
        </box>
        <box
          flexGrow={1}
          flexDirection="column"
          paddingLeft={1}
          paddingRight={1}
          paddingTop={1}
          paddingBottom={1}
        >
          {...rightContent}
        </box>
      </box>
    </box>
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
