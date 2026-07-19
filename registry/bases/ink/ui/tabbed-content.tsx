import { Box, Text } from "ink";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

export interface TabbedContentTab {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabbedContentProps extends InteractionProps {
  tabs: TabbedContentTab[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  defaultTab?: string;
  activeTab?: string;
  onChange?: (id: string) => void;
  tabBarStyle?: "underline" | "box" | "minimal";
  "aria-label"?: string;
}

export const TabbedContent = ({
  tabs,
  value,
  defaultValue,
  defaultTab,
  activeTab: controlledTab,
  onValueChange,
  onChange,
  tabBarStyle = "underline",
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel = "Tabbed content",
}: TabbedContentProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const [internalTab, setInternalTab] = useState(
    defaultValue ?? defaultTab ?? tabs.find((tab) => !tab.disabled)?.id ?? ""
  );
  const activeId = value ?? controlledTab ?? internalTab;
  const activeIndex = tabs.findIndex((t) => t.id === activeId);

  const switchTab = (id: string) => {
    if (value === undefined && controlledTab === undefined) {
      setInternalTab(id);
    }
    onValueChange?.(id);
    onChange?.(id);
  };

  const { isFocused } = useInteraction(
    (_input, key) => {
      if (key.leftArrow) {
        let prev = activeIndex - 1;
        while (prev >= 0 && tabs[prev]?.disabled) {
          prev -= 1;
        }
        if (prev >= 0) {
          switchTab(tabs[prev].id);
        }
      } else if (key.rightArrow) {
        let next = activeIndex + 1;
        while (next < tabs.length && tabs[next]?.disabled) {
          next += 1;
        }
        if (next < tabs.length) {
          switchTab(tabs[next].id);
        }
      } else if (key.home) {
        const first = tabs.find((tab) => !tab.disabled);
        if (first) {
          switchTab(first.id);
        }
      } else if (key.end) {
        const last = tabs.findLast((tab) => !tab.disabled);
        if (last) {
          switchTab(last.id);
        }
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const activeTab = tabs.find((t) => t.id === activeId);

  const renderTabBar = () => {
    if (tabBarStyle === "box") {
      return (
        <Box
          aria-role="tablist"
          borderStyle={resolveBorderStyle("single", unicode)}
          borderColor={theme.colors.border}
        >
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
              <Box
                key={tab.id}
                paddingX={1}
                aria-role="tab"
                aria-label={tab.label}
                aria-state={{
                  disabled: tab.disabled || undefined,
                  selected: isActive,
                }}
              >
                <Text color={textColor} bold={isActive} dimColor={tab.disabled}>
                  {isActive ? (isFocused ? "[>" : "[") : " "}
                  {tab.label}
                  {isActive ? (isFocused ? "<]" : "]") : " "}
                </Text>
                {idx < tabs.length - 1 && (
                  <Text color={theme.colors.border}>
                    {unicode ? " │ " : " | "}
                  </Text>
                )}
              </Box>
            );
          })}
        </Box>
      );
    }

    if (tabBarStyle === "minimal") {
      return (
        <Box gap={2} aria-role="tablist">
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
              <Box
                key={tab.id}
                aria-role="tab"
                aria-label={tab.label}
                aria-state={{
                  disabled: tab.disabled || undefined,
                  selected: isActive,
                }}
              >
                <Text color={textColor} bold={isActive} dimColor={tab.disabled}>
                  {isActive && isFocused ? `[${tab.label}]` : tab.label}
                </Text>
              </Box>
            );
          })}
        </Box>
      );
    }

    return (
      <Box aria-role="tablist">
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
            <Box
              key={tab.id}
              aria-role="tab"
              aria-label={tab.label}
              aria-state={{
                disabled: tab.disabled || undefined,
                selected: isActive,
              }}
            >
              <Text
                color={textColor}
                bold={isActive}
                underline={isActive}
                dimColor={tab.disabled}
              >
                {isActive && isFocused ? `[${tab.label}]` : tab.label}
              </Text>
              {idx < tabs.length - 1 && (
                <Text color={theme.colors.border}>
                  {unicode ? " │ " : " | "}
                </Text>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box
      flexDirection="column"
      aria-state={{ disabled: disabled || undefined }}
    >
      <Text aria-label={ariaLabel}>{""}</Text>
      {renderTabBar()}
      <Box
        borderStyle={resolveBorderStyle("single", unicode)}
        borderColor={theme.colors.border}
        paddingX={1}
        marginTop={0}
      >
        {activeTab?.content}
      </Box>
      <Text aria-hidden color={theme.colors.mutedForeground} dimColor>
        {unicode ? "←→ to switch tabs" : "left/right to switch tabs"}
      </Text>
    </Box>
  );
};
