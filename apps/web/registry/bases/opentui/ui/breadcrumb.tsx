/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface BreadcrumbItem {
  label: string;
  key: string;
  onSelect?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
  activeKey?: string;
}

export const Breadcrumb = ({
  items,
  separator = "›",
  activeKey,
}: BreadcrumbProps) => {
  const theme = useTheme();

  const activeIndex =
    activeKey === undefined
      ? items.length - 1
      : items.findIndex((i) => i.key === activeKey);

  useKeyboard((key) => {
    if (key.name === "left" && activeIndex > 0) {
      const prev = items[activeIndex - 1];
      if (prev?.onSelect) {
        prev.onSelect();
      }
    }
  });

  return (
    <box flexDirection="row" alignItems="center">
      {items.map((item, idx) => {
        const isActive = idx === activeIndex;
        return (
          <box key={item.key} flexDirection="row" alignItems="center">
            {isActive ? (
              <text fg={theme.colors.primary}>
                <b>{item.label}</b>
              </text>
            ) : (
              <text fg={theme.colors.mutedForeground}>{item.label}</text>
            )}
            {idx < items.length - 1 && (
              <text fg={theme.colors.mutedForeground}>{` ${separator} `}</text>
            )}
          </box>
        );
      })}
    </box>
  );
};
