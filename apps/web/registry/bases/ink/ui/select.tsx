import { Box, Text } from "ink";
import React, { useEffect, useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useFocus } from "@/hooks/use-focus";
import { useInput } from "@/hooks/use-input";

export interface SelectOption<T = string> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export interface SelectProps<T = string> {
  options: SelectOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  onSubmit?: (value: T) => void;
  label?: string;
  cursor?: string;
  cursorColor?: string;
  autoFocus?: boolean;
  isDisabled?: boolean;
  id?: string;
}

const findFirstEnabledIndex = <T,>(options: SelectOption<T>[]): number =>
  options.findIndex((option) => !option.disabled);

export const Select = <T = string,>({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  onSubmit,
  label,
  cursor = "›",
  cursorColor,
  autoFocus = false,
  isDisabled = false,
  id,
}: SelectProps<T>) => {
  const theme = useTheme();
  const initialValue = controlledValue ?? defaultValue;
  const selectedIndex = options.findIndex(
    (option) => !option.disabled && option.value === initialValue
  );
  const initialIndex =
    selectedIndex !== -1 ? selectedIndex : findFirstEnabledIndex(options);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const { isFocused } = useFocus({
    autoFocus,
    id,
    isActive: !isDisabled,
  });
  const selectedValue = controlledValue ?? internalValue;

  const resolvedCursorColor = cursorColor ?? theme.colors.primary;

  useEffect(() => {
    const activeOption = options[activeIndex];
    if (!activeOption || activeOption.disabled) {
      setActiveIndex(findFirstEnabledIndex(options));
    }
  }, [activeIndex, options]);

  useInput(
    (_input, key) => {
      if (key.upArrow) {
        setActiveIndex((index) => {
          let next = index - 1;
          while (next >= 0 && options[next]?.disabled) {
            next -= 1;
          }
          return next < 0 ? index : next;
        });
      } else if (key.downArrow) {
        setActiveIndex((index) => {
          let next = index + 1;
          while (next < options.length && options[next]?.disabled) {
            next += 1;
          }
          return next >= options.length ? index : next;
        });
      } else if (key.return) {
        const option = options[activeIndex];
        if (option && !option.disabled) {
          if (controlledValue === undefined) {
            setInternalValue(option.value);
          }
          onChange?.(option.value);
          onSubmit?.(option.value);
        }
      }
    },
    { isActive: isFocused && !isDisabled }
  );

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      {options.map((opt, idx) => {
        const isActive = idx === activeIndex;
        const isSelected =
          selectedValue !== undefined && opt.value === selectedValue;

        let optColor: string;
        if (opt.disabled) {
          optColor = theme.colors.mutedForeground;
        } else if (isActive) {
          optColor = resolvedCursorColor;
        } else {
          optColor = theme.colors.foreground;
        }

        return (
          <Box key={idx} gap={1}>
            <Text color={isActive ? resolvedCursorColor : undefined}>
              {isActive ? cursor : " "}
            </Text>
            <Text
              color={optColor}
              bold={isActive || isSelected}
              dimColor={opt.disabled}
            >
              {opt.label}
            </Text>
            {opt.hint && (
              <Text color={theme.colors.mutedForeground} dimColor>
                {opt.hint}
              </Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
