import { Box, Text } from "ink";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface Tab {
  key: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (key: string) => void;
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (key: string) => void;
  borderColor?: string;
  borderStyle?: BorderStyle;
  separator?: string;
  tabBarPaddingX?: number;
  paddingX?: number;
  paddingY?: number;
  id?: string;
  autoFocus?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}

export const Tabs = ({
  tabs,
  value,
  defaultValue,
  onValueChange,
  defaultTab,
  activeTab: controlledTab,
  onTabChange,
  borderColor,
  borderStyle = "single",
  separator,
  tabBarPaddingX = 2,
  paddingX = 1,
  paddingY = 0,
  id,
  autoFocus = false,
  isActive = true,
  disabled = false,
  "aria-label": ariaLabel,
}: TabsProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const [internalTab, setInternalTab] = useState(
    defaultValue ?? defaultTab ?? tabs.find((tab) => !tab.disabled)?.key ?? ""
  );
  const activeKey = value ?? controlledTab ?? internalTab;
  const activeIndex = tabs.findIndex((t) => t.key === activeKey);

  const resolvedBorderColor = borderColor ?? theme.colors.border;
  const resolvedSeparator = separator ?? (unicode ? " │ " : " | ");

  const switchTab = (nextKey: string | undefined) => {
    if (!nextKey || nextKey === activeKey) {
      return;
    }
    const nextTab = tabs.find((tab) => tab.key === nextKey);
    if (nextTab?.disabled) {
      return;
    }
    const changeHandler = onValueChange ?? onTabChange;
    if (changeHandler) {
      changeHandler(nextKey);
    } else {
      setInternalTab(nextKey);
    }
  };

  const { isFocused } = useInteraction(
    (input, key) => {
      if (key.leftArrow || key.rightArrow) {
        const direction = key.leftArrow ? -1 : 1;
        let nextIndex = activeIndex;
        for (const _tab of tabs) {
          nextIndex = (nextIndex + direction + tabs.length) % tabs.length;
          if (!tabs[nextIndex]?.disabled) {
            switchTab(tabs[nextIndex]?.key);
            break;
          }
        }
      } else if (key.home) {
        switchTab(tabs.find((tab) => !tab.disabled)?.key);
      } else if (key.end) {
        switchTab(tabs.findLast((tab) => !tab.disabled)?.key);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const activeTab = tabs.find((t) => t.key === activeKey);

  return (
    <Box flexDirection="column">
      <Box
        aria-role="tablist"
        aria-state={{ disabled }}
        paddingX={tabBarPaddingX}
        gap={0}
      >
        <Text aria-label={ariaLabel ?? "Tabs"}>{""}</Text>
        {tabs.map((tab, idx) => {
          const isActive = tab.key === activeKey;
          return (
            <Box
              key={tab.key}
              aria-label={tab.label}
              aria-role="tab"
              aria-state={{ disabled: tab.disabled, selected: isActive }}
            >
              <Text
                aria-hidden
                color={
                  isActive ? theme.colors.primary : theme.colors.mutedForeground
                }
                bold={isActive}
                underline={isActive}
                inverse={isFocused && isActive}
              >
                {tab.label}
              </Text>
              {idx < tabs.length - 1 && (
                <Text aria-hidden color={resolvedBorderColor}>
                  {resolvedSeparator}
                </Text>
              )}
            </Box>
          );
        })}
      </Box>
      <Box
        borderStyle={resolveBorderStyle(borderStyle, unicode)}
        borderColor={resolvedBorderColor}
        paddingX={paddingX}
        paddingY={paddingY}
      >
        {activeTab?.content}
      </Box>
    </Box>
  );
};
