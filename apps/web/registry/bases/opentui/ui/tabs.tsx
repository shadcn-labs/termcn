/* @jsxImportSource @opentui/react */
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import { useInteraction } from "@/registry/bases/opentui/hooks/use-interaction";
import type {
  InteractionProps,
  PressDetails,
} from "@/registry/bases/opentui/hooks/use-interaction";
import type { BorderStyle } from "@/registry/bases/opentui/ui/types";

export interface Tab {
  key: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export type TabsChangeDetails = PressDetails | Readonly<{ source: "focus" }>;

export interface TabsProps extends InteractionProps {
  tabs: Tab[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (key: string, details: TabsChangeDetails) => void;
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (key: string) => void;
  borderColor?: string;
  borderStyle?: BorderStyle;
  separator?: string;
  tabBarPaddingX?: number;
  paddingX?: number;
  paddingY?: number;
  loopFocus?: boolean;
  activationMode?: "automatic" | "manual";
  orientation?: "horizontal" | "vertical";
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
  separator = " │ ",
  tabBarPaddingX = 2,
  paddingX = 1,
  paddingY = 0,
  loopFocus = true,
  activationMode = "automatic",
  orientation = "horizontal",
  autoFocus = false,
  disabled = false,
  id,
  isActive = true,
}: TabsProps) => {
  const theme = useTheme();
  const [internalTab, setInternalTab] = useState(
    defaultValue ?? defaultTab ?? tabs.find((tab) => !tab.disabled)?.key ?? ""
  );
  const controlledValue = value ?? controlledTab;
  const activeKey = controlledValue ?? internalTab;
  const [focusedKey, setFocusedKey] = useState(activeKey);
  const previousActiveKeyRef = useRef(activeKey);
  const pointerKeyRef = useRef<string | null>(null);
  const focusedIndex = tabs.findIndex((tab) => tab.key === focusedKey);

  useEffect(() => {
    const focusedTab = tabs.find(
      (tab) => tab.key === focusedKey && !tab.disabled
    );
    const activeTab = tabs.find(
      (tab) => tab.key === activeKey && !tab.disabled
    );
    const fallback = tabs.find((tab) => !tab.disabled);
    if (previousActiveKeyRef.current !== activeKey || !focusedTab) {
      setFocusedKey(activeTab?.key ?? fallback?.key ?? "");
    }
    previousActiveKeyRef.current = activeKey;
  }, [activeKey, focusedKey, tabs]);

  const resolvedBorderColor = borderColor ?? theme.colors.border;

  const switchTab = (
    nextKey: string | undefined,
    details: TabsChangeDetails
  ) => {
    if (!nextKey || nextKey === activeKey) {
      return;
    }
    const nextTab = tabs.find((tab) => tab.key === nextKey);
    if (nextTab?.disabled) {
      return;
    }
    if (controlledValue === undefined) {
      setInternalTab(nextKey);
    }
    if (onValueChange) {
      onValueChange(nextKey, details);
    } else {
      onTabChange?.(nextKey);
    }
  };

  const focusTab = (nextKey: string | undefined) => {
    if (!nextKey) {
      return;
    }
    const nextTab = tabs.find((tab) => tab.key === nextKey);
    if (!nextTab || nextTab.disabled) {
      return;
    }
    setFocusedKey(nextKey);
    if (activationMode === "automatic") {
      switchTab(nextKey, Object.freeze({ source: "focus" }));
    }
  };

  const move = (direction: -1 | 1) => {
    if (tabs.length === 0) {
      return;
    }
    let nextIndex = Math.max(0, focusedIndex);
    for (const _tab of tabs) {
      const candidate = nextIndex + direction;
      if (!loopFocus && (candidate < 0 || candidate >= tabs.length)) {
        return;
      }
      nextIndex = (candidate + tabs.length) % tabs.length;
      if (!tabs[nextIndex]?.disabled) {
        focusTab(tabs[nextIndex]?.key);
        return;
      }
    }
  };

  const interaction = useInteraction({
    autoFocus,
    disabled,
    id,
    isActive,
    onInput: (key) => {
      const previousKey = orientation === "horizontal" ? "left" : "up";
      const nextKey = orientation === "horizontal" ? "right" : "down";
      if (key.name === previousKey) {
        move(-1);
      } else if (key.name === nextKey) {
        move(1);
      } else if (key.name === "home") {
        focusTab(tabs.find((tab) => !tab.disabled)?.key);
      } else if (key.name === "end") {
        focusTab(tabs.findLast((tab) => !tab.disabled)?.key);
      }
    },
    onPress: (details) => {
      const targetKey =
        details.source === "pointer" ? pointerKeyRef.current : focusedKey;
      pointerKeyRef.current = null;
      switchTab(targetKey ?? undefined, details);
    },
  });
  const { onMouseOut, ...interactionProps } = interaction.interactionProps;
  const { isFocused } = interaction;

  const activeTab = tabs.find((t) => t.key === activeKey);

  return (
    <box flexDirection="column">
      <box
        {...interactionProps}
        paddingLeft={tabBarPaddingX}
        paddingRight={tabBarPaddingX}
        flexDirection={orientation === "vertical" ? "column" : "row"}
        gap={0}
        onMouseOut={() => {
          pointerKeyRef.current = null;
          onMouseOut();
        }}
      >
        {tabs.map((tab, idx) => {
          const isSelected = tab.key === activeKey;
          const isFocusedTab = tab.key === focusedKey;
          return (
            <box
              key={tab.key}
              onMouseDown={(event) => {
                const canSelect =
                  !event.defaultPrevented &&
                  (event.button === undefined || event.button === 0) &&
                  !tab.disabled;
                pointerKeyRef.current = canSelect ? tab.key : null;
                if (canSelect) {
                  setFocusedKey(tab.key);
                }
              }}
            >
              <text
                fg={
                  tab.disabled
                    ? theme.colors.mutedForeground
                    : isSelected
                      ? theme.colors.primary
                      : theme.colors.mutedForeground
                }
                inverse={isFocused && isFocusedTab}
              >
                {isSelected ? (
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
        borderStyle={borderStyle}
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
