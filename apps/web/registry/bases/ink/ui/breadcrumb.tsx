import { Box, Text } from "ink";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

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

  useInput((_input, key) => {
    if (key.leftArrow && activeIndex > 0) {
      const prev = items[activeIndex - 1];
      if (prev?.onSelect) {
        prev.onSelect();
      }
    }
  });

  return (
    <Box flexDirection="row" alignItems="center">
      {items.map((item, idx) => {
        const isActive = idx === activeIndex;
        return (
          <Box key={item.key} flexDirection="row" alignItems="center">
            <Text
              color={
                isActive ? theme.colors.primary : theme.colors.mutedForeground
              }
              bold={isActive}
            >
              {item.label}
            </Text>
            {idx < items.length - 1 && (
              <Text color={theme.colors.mutedForeground}> {separator} </Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
