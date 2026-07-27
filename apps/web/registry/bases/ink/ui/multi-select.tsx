import { Box, Text } from "ink";
import React, { useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveTerminalSymbol } from "@/registry/bases/ink/lib/accessibility";

export interface MultiSelectOption<T = string> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export interface MultiSelectProps<T = string> {
  options: MultiSelectOption<T>[];
  value?: T[];
  defaultValue?: T[];
  onValueChange?: (values: T[]) => void;
  onChange?: (values: T[]) => void;
  onSubmit?: (values: T[]) => void;
  cursor?: string;
  checkmark?: string;
  height?: number;
  label?: string;
  id?: string;
  autoFocus?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}

export const MultiSelect = <T = string,>({
  options,
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  onChange,
  onSubmit,
  cursor,
  checkmark,
  height,
  label,
  id,
  autoFocus = false,
  isActive = true,
  disabled = false,
  "aria-label": ariaLabel,
}: MultiSelectProps<T>) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedCursor = cursor ?? resolveTerminalSymbol(unicode, "›", ">");
  const resolvedCheckmark =
    checkmark ?? resolveTerminalSymbol(unicode, "◉", "[x]");
  const [activeIndex, setActiveIndex] = useState(0);
  const [internalSelected, setInternalSelected] = useState<T[]>(defaultValue);

  const selected = controlledValue ?? internalSelected;

  const scrollOffset = (() => {
    if (!height) {
      return 0;
    }
    const half = Math.floor(height / 2);
    const maxOffset = options.length - height;
    const offset = activeIndex - half;
    if (offset < 0) {
      return 0;
    }
    if (offset > maxOffset) {
      return Math.max(0, maxOffset);
    }
    return offset;
  })();

  const visibleOptions = height
    ? options.slice(scrollOffset, scrollOffset + height)
    : options;

  const { isFocused } = useInteraction(
    (input, key) => {
      if (key.upArrow) {
        setActiveIndex((i) => {
          let next = i - 1;
          while (next >= 0 && options[next]?.disabled) {
            next -= 1;
          }
          return next < 0 ? i : next;
        });
      } else if (key.downArrow) {
        setActiveIndex((i) => {
          let next = i + 1;
          while (next < options.length && options[next]?.disabled) {
            next += 1;
          }
          return next >= options.length ? i : next;
        });
      } else if (input === " ") {
        const opt = options[activeIndex];
        if (!opt || opt.disabled) {
          return;
        }
        const isSelected = selected.includes(opt.value);
        const next = isSelected
          ? selected.filter((v) => v !== opt.value)
          : [...selected, opt.value];
        if (controlledValue === undefined) {
          setInternalSelected(next);
        }
        (onValueChange ?? onChange)?.(next);
      } else if (key.return) {
        onSubmit?.(selected);
      } else if (key.home) {
        const firstEnabled = options.findIndex((option) => !option.disabled);
        if (firstEnabled !== -1) {
          setActiveIndex(firstEnabled);
        }
      } else if (key.end) {
        const lastEnabled = options.findLastIndex((option) => !option.disabled);
        if (lastEnabled !== -1) {
          setActiveIndex(lastEnabled);
        }
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  return (
    <Box
      aria-role="listbox"
      aria-state={{ disabled, multiselectable: true }}
      flexDirection="column"
    >
      <Text
        aria-label={ariaLabel ?? label ?? "Multi select"}
        bold={Boolean(label)}
      >
        {label ?? ""}
      </Text>
      {visibleOptions.map((opt, visibleIdx) => {
        const idx = scrollOffset + visibleIdx;
        const isActive = idx === activeIndex;
        const isSelected = selected.includes(opt.value);
        const icon = isSelected
          ? resolvedCheckmark
          : resolveTerminalSymbol(unicode, "○", "[ ]");

        let iconColor: string;
        if (opt.disabled) {
          iconColor = theme.colors.mutedForeground;
        } else if (isSelected) {
          iconColor = theme.colors.primary;
        } else {
          iconColor = theme.colors.foreground;
        }

        let labelColor: string;
        if (opt.disabled) {
          labelColor = theme.colors.mutedForeground;
        } else if (isActive) {
          labelColor = theme.colors.primary;
        } else {
          labelColor = theme.colors.foreground;
        }

        return (
          <Box
            key={idx}
            aria-label={opt.hint ? `${opt.label}: ${opt.hint}` : opt.label}
            aria-role="option"
            aria-state={{ disabled: opt.disabled, selected: isSelected }}
            gap={1}
          >
            <Text
              aria-hidden
              color={isActive ? theme.colors.primary : undefined}
            >
              {isFocused && isActive ? resolvedCursor : " "}
            </Text>
            <Text aria-hidden color={iconColor} dimColor={opt.disabled}>
              {icon}
            </Text>
            <Text
              aria-hidden
              color={labelColor}
              bold={isFocused && isActive}
              dimColor={opt.disabled}
            >
              {opt.label}
            </Text>
            {opt.hint && (
              <Text aria-hidden color={theme.colors.mutedForeground} dimColor>
                {opt.hint}
              </Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
