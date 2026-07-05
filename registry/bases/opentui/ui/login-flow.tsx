/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import type { BorderStyle } from "@/components/ui/opentui-theme-provider";

import { BigText } from "./big-text";
import type { BigTextFont } from "./big-text";

export interface LoginFlowProps {
  title?: string;
  titleFont?: BigTextFont;
  titleColor?: string;
  padding?: number;
  onSelect?: (index: number) => void;
  children: ReactNode;
}

export interface LoginFlowAnnouncementProps {
  icon?: string;
  iconColor?: string;
  borderStyle?: BorderStyle;
  borderColor?: string;
  children: ReactNode;
}

export interface LoginFlowDescriptionProps {
  bold?: boolean;
  dim?: boolean;
  color?: string;
  children: ReactNode;
}

export interface LoginFlowSelectProps {
  label?: string;
  labelBold?: boolean;
  options: string[];
  activeIndex?: number;
  defaultIndex?: number;
  cursor?: string;
  cursorColor?: string;
  activeColor?: string;
  onSelect?: (index: number) => void;
  keyboardNav?: boolean;
}

const LoginFlowRoot = ({
  title,
  titleFont = "block",
  titleColor,
  padding = 2,
  children,
}: LoginFlowProps) => {
  const theme = useTheme();
  const resolvedColor = titleColor ?? theme.colors.primary;

  return (
    <box flexDirection="column" paddingLeft={padding}>
      {title && (
        <box marginBottom={1}>
          {title.includes("\n") ? (
            <box flexDirection="column">
              {title.split("\n").map((line, i) => (
                <box key={i}>
                  <BigText color={resolvedColor} font={titleFont}>
                    {line}
                  </BigText>
                </box>
              ))}
            </box>
          ) : (
            <BigText font={titleFont} color={resolvedColor}>
              {title}
            </BigText>
          )}
        </box>
      )}
      {children}
    </box>
  );
};

const LoginFlowAnnouncement = ({
  icon = "*",
  iconColor,
  borderStyle = "single",
  borderColor,
  children,
}: LoginFlowAnnouncementProps) => {
  const theme = useTheme();
  return (
    <box
      borderColor={borderColor ?? theme.colors.border}
      flexDirection="row"
      paddingLeft={1}
      paddingRight={1}
      marginBottom={1}
    >
      <text fg={iconColor ?? theme.colors.primary}>{`${icon} `}</text>
      <text>{children}</text>
    </box>
  );
};

const LoginFlowDescription = ({
  bold: boldText = false,
  dim = false,
  color,
  children,
}: LoginFlowDescriptionProps) => (
  <box marginBottom={1}>
    <text fg={dim ? "#666" : color}>
      {boldText ? <b>{children}</b> : children}
    </text>
  </box>
);

const LoginFlowSelect = ({
  label,
  labelBold = false,
  options,
  activeIndex: controlledIndex,
  defaultIndex = 0,
  cursor = "›",
  cursorColor = "cyan",
  activeColor = "cyan",
  onSelect,
  keyboardNav = true,
}: LoginFlowSelectProps) => {
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const activeIdx = controlledIndex ?? internalIndex;

  useKeyboard((key) => {
    if (!keyboardNav) {
      return;
    }
    if (key.name === "up") {
      const next = Math.max(0, activeIdx - 1);
      if (controlledIndex === undefined) {
        setInternalIndex(next);
      }
    } else if (key.name === "down") {
      const next = Math.min(options.length - 1, activeIdx + 1);
      if (controlledIndex === undefined) {
        setInternalIndex(next);
      }
    } else if (key.name === "return") {
      onSelect?.(activeIdx);
    } else {
      const num = Number.parseInt(key.name, 10);
      if (!Number.isNaN(num) && num >= 1 && num <= options.length) {
        const idx = num - 1;
        if (controlledIndex === undefined) {
          setInternalIndex(idx);
        }
        onSelect?.(idx);
      }
    }
  });

  return (
    <box flexDirection="column" marginTop={1}>
      {label && (
        <box marginBottom={1}>
          <text>{labelBold ? <b>{label}</b> : label}</text>
        </box>
      )}
      {options.map((opt, i) => {
        const isActive = i === activeIdx;
        return (
          <box key={i} flexDirection="row">
            <text fg={isActive ? cursorColor : undefined}>
              {isActive ? `${cursor} ` : "  "}
            </text>
            <text fg={isActive ? undefined : "#666"}>{`${i + 1}.  `}</text>
            <text fg={isActive ? activeColor : undefined}>{opt}</text>
          </box>
        );
      })}
    </box>
  );
};

export const LoginFlow = Object.assign(LoginFlowRoot, {
  Announcement: LoginFlowAnnouncement,
  Description: LoginFlowDescription,
  Select: LoginFlowSelect,
});
