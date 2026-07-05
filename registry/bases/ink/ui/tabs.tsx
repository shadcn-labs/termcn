import { Box, Text, useStdout } from "ink";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import type { BorderStyle } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

export interface Tab {
  key: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (key: string) => void;
  borderColor?: string;
  borderStyle?: BorderStyle;
  separator?: string;
  tabBarPaddingX?: number;
  paddingX?: number;
  paddingY?: number;
}

export const Tabs = ({
  tabs,
  defaultTab,
  activeTab: controlledTab,
  onTabChange,
  borderColor,
  borderStyle = "single",
  separator = " │ ",
  tabBarPaddingX = 2,
  paddingX = 1,
  paddingY = 0,
}: TabsProps) => {
  const theme = useTheme();
  const { stdout } = useStdout();
  const [internalTab, setInternalTab] = useState(
    defaultTab ?? tabs[0]?.key ?? ""
  );
  const activeKey = controlledTab ?? internalTab;
  const activeIndex = tabs.findIndex((t) => t.key === activeKey);

  const resolvedBorderColor = borderColor ?? theme.colors.border;

  const switchTab = (nextKey: string | undefined) => {
    if (!nextKey || nextKey === activeKey) {
      return;
    }
    stdout.write("\u001B[2J\u001B[H");
    if (onTabChange) {
      onTabChange(nextKey);
    } else {
      setInternalTab(nextKey);
    }
  };

  useInput((input, key) => {
    if (key.leftArrow || (key.shift && key.tab)) {
      switchTab(tabs[Math.max(0, activeIndex - 1)]?.key);
    } else if (key.rightArrow || key.tab) {
      switchTab(tabs[Math.min(tabs.length - 1, activeIndex + 1)]?.key);
    }
  });

  const activeTab = tabs.find((t) => t.key === activeKey);

  return (
    <Box flexDirection="column">
      <Box paddingX={tabBarPaddingX} gap={0}>
        {tabs.map((tab, idx) => {
          const isActive = tab.key === activeKey;
          return (
            <Box key={tab.key}>
              <Text
                color={
                  isActive ? theme.colors.primary : theme.colors.mutedForeground
                }
                bold={isActive}
                underline={isActive}
              >
                {tab.label}
              </Text>
              {idx < tabs.length - 1 && (
                <Text color={resolvedBorderColor}>{separator}</Text>
              )}
            </Box>
          );
        })}
      </Box>
      <Box
        borderStyle={borderStyle}
        borderColor={resolvedBorderColor}
        paddingX={paddingX}
        paddingY={paddingY}
      >
        {activeTab?.content}
      </Box>
    </Box>
  );
};
