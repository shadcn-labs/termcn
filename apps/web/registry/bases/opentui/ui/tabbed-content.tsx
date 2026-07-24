/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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

  useKeyboard((key) => {
    if (key.name === "left" || (key.shift && key.name === "tab")) {
      let prev = activeIndex - 1;
      while (prev >= 0 && tabs[prev]?.disabled) {
        prev -= 1;
      }
      if (prev >= 0) {
        switchTab(tabs[prev].id);
      }
    } else if (key.name === "right" || key.name === "tab") {
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
        <box borderStyle="single" borderColor={theme.colors.border}>
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
              <box key={tab.id} paddingLeft={1} paddingRight={1}>
                <text fg={textColor}>
                  {isActive ? <b>{`[${tab.label}]`}</b> : ` ${tab.label} `}
                </text>
                {idx < tabs.length - 1 && (
                  <text fg={theme.colors.border}>{" │ "}</text>
                )}
              </box>
            );
          })}
        </box>
      );
    }

    if (tabBarStyle === "minimal") {
      return (
        <box gap={2}>
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
              <text key={tab.id} fg={textColor}>
                {isActive ? <b>{tab.label}</b> : tab.label}
              </text>
            );
          })}
        </box>
      );
    }

    return (
      <box>
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
            <box key={tab.id}>
              <text fg={textColor}>
                {isActive ? (
                  <b>
                    <u>{tab.label}</u>
                  </b>
                ) : (
                  tab.label
                )}
              </text>
              {idx < tabs.length - 1 && (
                <text fg={theme.colors.border}>{" │ "}</text>
              )}
            </box>
          );
        })}
      </box>
    );
  };

  return (
    <box flexDirection="column">
      {renderTabBar()}
      <box
        borderStyle="single"
        borderColor={theme.colors.border}
        paddingLeft={1}
        paddingRight={1}
        marginTop={0}
      >
        {activeTab?.content}
      </box>
      <text fg="#666">←→ or Tab to switch tabs</text>
    </box>
  );
};
