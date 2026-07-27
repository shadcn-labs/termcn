import { Box, Text } from "ink";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

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

export interface LoginFlowSelectProps extends InteractionProps {
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
  "aria-label"?: string;
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
    <Box flexDirection="column" paddingLeft={padding} aria-role="list">
      {title && (
        <Box marginBottom={1}>
          {title.includes("\n") ? (
            <Box flexDirection="column">
              {title.split("\n").map((line, i) => (
                <BigText key={i} font={titleFont} color={resolvedColor}>
                  {line}
                </BigText>
              ))}
            </Box>
          ) : (
            <BigText font={titleFont} color={resolvedColor}>
              {title}
            </BigText>
          )}
        </Box>
      )}
      {children}
    </Box>
  );
};

const LoginFlowAnnouncement = ({
  icon = "*",
  iconColor,
  borderStyle = "single",
  borderColor,
  children,
}: LoginFlowAnnouncementProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  return (
    <Box
      borderStyle={resolveBorderStyle(borderStyle, unicode)}
      borderColor={borderColor ?? theme.colors.border}
      flexDirection="row"
      paddingX={1}
      marginBottom={1}
    >
      <Text color={iconColor ?? theme.colors.primary}>{`${icon} `}</Text>
      <Text>{children}</Text>
    </Box>
  );
};

const LoginFlowDescription = ({
  bold: boldText = false,
  dim = false,
  color,
  children,
}: LoginFlowDescriptionProps) => (
  <Box marginBottom={1}>
    <Text bold={boldText} dimColor={dim} color={color}>
      {children}
    </Text>
  </Box>
);

const LoginFlowSelect = ({
  label,
  labelBold = false,
  options,
  activeIndex: controlledIndex,
  defaultIndex = 0,
  cursor,
  cursorColor = "cyan",
  activeColor = "cyan",
  onSelect,
  keyboardNav = true,
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel = label ?? "Login options",
}: LoginFlowSelectProps) => {
  const unicode = useUnicode();
  const resolvedCursor = cursor ?? (unicode ? "›" : ">");
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const activeIdx = controlledIndex ?? internalIndex;

  const { isFocused } = useInteraction(
    (input, key) => {
      if (!keyboardNav) {
        return;
      }
      if (key.upArrow) {
        const next = Math.max(0, activeIdx - 1);
        if (controlledIndex === undefined) {
          setInternalIndex(next);
        }
      } else if (key.downArrow) {
        const next = Math.min(options.length - 1, activeIdx + 1);
        if (controlledIndex === undefined) {
          setInternalIndex(next);
        }
      } else if (key.home) {
        if (controlledIndex === undefined) {
          setInternalIndex(0);
        }
      } else if (key.end) {
        if (controlledIndex === undefined) {
          setInternalIndex(Math.max(0, options.length - 1));
        }
      } else if (key.return) {
        onSelect?.(activeIdx);
      } else {
        const num = Number.parseInt(input, 10);
        if (!Number.isNaN(num) && num >= 1 && num <= options.length) {
          const idx = num - 1;
          if (controlledIndex === undefined) {
            setInternalIndex(idx);
          }
          onSelect?.(idx);
        }
      }
    },
    { autoFocus, disabled, id, isActive: isActive && keyboardNav }
  );

  return (
    <Box
      flexDirection="column"
      marginTop={1}
      aria-role="listbox"
      aria-state={{ disabled: disabled || undefined }}
    >
      <Text aria-label={ariaLabel}>{""}</Text>
      {label && (
        <Box marginBottom={1}>
          <Text bold={labelBold}>{label}</Text>
        </Box>
      )}
      {options.map((opt, i) => {
        const isActive = i === activeIdx;
        return (
          <Box
            key={i}
            flexDirection="row"
            aria-role="option"
            aria-label={opt}
            aria-state={{ selected: isActive }}
          >
            <Text color={isActive ? cursorColor : undefined}>
              {isActive && isFocused ? `[${resolvedCursor}] ` : "  "}
            </Text>
            <Text color={isActive ? undefined : undefined} dimColor={!isActive}>
              {i + 1}.{"  "}
            </Text>
            <Text color={isActive ? activeColor : undefined}>{opt}</Text>
          </Box>
        );
      })}
    </Box>
  );
};

export const LoginFlow = Object.assign(LoginFlowRoot, {
  Announcement: LoginFlowAnnouncement,
  Description: LoginFlowDescription,
  Select: LoginFlowSelect,
});
