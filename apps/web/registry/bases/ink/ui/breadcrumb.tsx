import { Box, Text } from "ink";

import { useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveTerminalSymbol } from "@/registry/bases/ink/lib/accessibility";

export interface BreadcrumbItem {
  label: string;
  key: string;
  onSelect?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
  activeKey?: string;
  id?: string;
  autoFocus?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}

export const Breadcrumb = ({
  items,
  separator,
  activeKey,
  id,
  autoFocus = false,
  isActive = true,
  disabled = false,
  "aria-label": ariaLabel,
}: BreadcrumbProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedSeparator =
    separator ?? resolveTerminalSymbol(unicode, "›", ">");

  const activeIndex =
    activeKey === undefined
      ? items.length - 1
      : items.findIndex((i) => i.key === activeKey);

  const { isFocused } = useInteraction(
    (_input, key) => {
      if (key.leftArrow && activeIndex > 0) {
        const prev = items[activeIndex - 1];
        if (prev?.onSelect) {
          prev.onSelect();
        }
      }
      if (key.rightArrow && activeIndex < items.length - 1) {
        items[activeIndex + 1]?.onSelect?.();
      }
      if (key.home) {
        items[0]?.onSelect?.();
      }
      if (key.end) {
        items.at(-1)?.onSelect?.();
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  return (
    <Box aria-role="list" flexDirection="row" alignItems="center">
      <Text aria-label={ariaLabel ?? "Breadcrumb"}>
        {isFocused ? ">" : " "}
      </Text>
      {items.map((item, idx) => {
        const isActive = idx === activeIndex;
        return (
          <Box
            key={item.key}
            aria-label={item.label}
            aria-role="listitem"
            aria-state={{ disabled, selected: isActive }}
            flexDirection="row"
            alignItems="center"
          >
            <Text
              aria-hidden
              color={
                isActive ? theme.colors.primary : theme.colors.mutedForeground
              }
              bold={isActive}
            >
              {item.label}
            </Text>
            {idx < items.length - 1 && (
              <Text aria-hidden color={theme.colors.mutedForeground}>
                {" "}
                {resolvedSeparator}{" "}
              </Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
