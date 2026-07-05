import { Box, Text } from "ink";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

export interface TabbedContentTab {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabbedContentProps {
  tabs: TabbedContentTab[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (id: string) => void;
  tabBarStyle?: "underline" | "box" | "minimal";
}

export const TabbedContent = ({
  tabs,
  defaultTab,
  activeTab: controlledTab,
  onChange,
  tabBarStyle = "underline",
}: TabbedContentProps) => {
  const theme = useTheme();
  const [internalTab, setInternalTab] = useState(
    defaultTab ?? tabs[0]?.id ?? ""
  );
  const activeId = controlledTab ?? internalTab;
  const activeIndex = tabs.findIndex((t) => t.id === activeId);

  const switchTab = (id: string) => {
    if (onChange) {
      onChange(id);
    } else {
      setInternalTab(id);
    }
  };

  useInput((_input, key) => {
    if (key.leftArrow || (key.shift && key.tab)) {
      let prev = activeIndex - 1;
      while (prev >= 0 && tabs[prev]?.disabled) {
        prev -= 1;
      }
      if (prev >= 0) {
        switchTab(tabs[prev].id);
      }
    } else if (key.rightArrow || key.tab) {
      let next = activeIndex + 1;
      while (next < tabs.length && tabs[next]?.disabled) {
        next += 1;
      }
      if (next < tabs.length) {
        switchTab(tabs[next].id);
      }
    }
  });

  const activeTab = tabs.find((t) => t.id === activeId);

  const renderTabBar = () => {
    if (tabBarStyle === "box") {
      return (
        <Box borderStyle="single" borderColor={theme.colors.border}>
          {tabs.map((tab, idx) => {
            const isActive = tab.id === activeId;
            let textColor: string;
            if (tab.disabled) {
              textColor = theme.colors.mutedForeground;
            } else if (isActive) {
              textColor = theme.colors.primary;
            } else {
              textColor = theme.colors.foreground;
            }
            return (
              <Box key={tab.id} paddingX={1}>
                <Text color={textColor} bold={isActive} dimColor={tab.disabled}>
                  {isActive ? "[" : " "}
                  {tab.label}
                  {isActive ? "]" : " "}
                </Text>
                {idx < tabs.length - 1 && (
                  <Text color={theme.colors.border}> │ </Text>
                )}
              </Box>
            );
          })}
        </Box>
      );
    }

    if (tabBarStyle === "minimal") {
      return (
        <Box gap={2}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeId;
            let textColor: string;
            if (tab.disabled) {
              textColor = theme.colors.mutedForeground;
            } else if (isActive) {
              textColor = theme.colors.primary;
            } else {
              textColor = theme.colors.mutedForeground;
            }
            return (
              <Text
                key={tab.id}
                color={textColor}
                bold={isActive}
                dimColor={tab.disabled}
              >
                {tab.label}
              </Text>
            );
          })}
        </Box>
      );
    }

    return (
      <Box>
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeId;
          let textColor: string;
          if (tab.disabled) {
            textColor = theme.colors.mutedForeground;
          } else if (isActive) {
            textColor = theme.colors.primary;
          } else {
            textColor = theme.colors.foreground;
          }
          return (
            <Box key={tab.id}>
              <Text
                color={textColor}
                bold={isActive}
                underline={isActive}
                dimColor={tab.disabled}
              >
                {tab.label}
              </Text>
              {idx < tabs.length - 1 && (
                <Text color={theme.colors.border}> │ </Text>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box flexDirection="column">
      {renderTabBar()}
      <Box
        borderStyle="single"
        borderColor={theme.colors.border}
        paddingX={1}
        marginTop={0}
      >
        {activeTab?.content}
      </Box>
      <Text color={theme.colors.mutedForeground} dimColor>
        ←→ or Tab to switch tabs
      </Text>
    </Box>
  );
};
