/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import type { BorderStyle } from "@/registry/bases/opentui/ui/types";

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
    process.stdout.write("\u001B[2J\u001B[H");
    if (onTabChange) {
      onTabChange(nextKey);
    } else {
      setInternalTab(nextKey);
    }
  };

  useKeyboard((key) => {
    if (key.name === "left" || (key.shift && key.name === "tab")) {
      switchTab(tabs[Math.max(0, activeIndex - 1)]?.key);
    } else if (key.name === "right" || key.name === "tab") {
      switchTab(tabs[Math.min(tabs.length - 1, activeIndex + 1)]?.key);
    }
  });

  const activeTab = tabs.find((t) => t.key === activeKey);

  return (
    <box flexDirection="column">
      <box paddingLeft={tabBarPaddingX} paddingRight={tabBarPaddingX} gap={0}>
        {tabs.map((tab, idx) => {
          const isActive = tab.key === activeKey;
          return (
            <box key={tab.key}>
              <text
                fg={
                  isActive ? theme.colors.primary : theme.colors.mutedForeground
                }
              >
                {isActive ? (
                  <b>
                    <u>{tab.label}</u>
                  </b>
                ) : (
                  tab.label
                )}
              </text>
              {idx < tabs.length - 1 && (
                <text fg={resolvedBorderColor}>{separator}</text>
              )}
            </box>
          );
        })}
      </box>
      <box
        borderColor={resolvedBorderColor}
        paddingLeft={paddingX}
        paddingRight={paddingX}
        paddingTop={paddingY}
        paddingBottom={paddingY}
      >
        {activeTab?.content}
      </box>
    </box>
  );
};
