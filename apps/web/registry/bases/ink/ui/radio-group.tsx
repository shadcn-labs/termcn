import { Box, Text } from "ink";
import React, { useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveTerminalSymbol } from "@/registry/bases/ink/lib/accessibility";

export interface RadioOption<T = string> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T = string> {
  options: RadioOption<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  onChange?: (value: T) => void;
  name?: string;
  cursor?: string;
  id?: string;
  autoFocus?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}

const getOptionColor = (
  disabled: boolean | undefined,
  isHighlighted: boolean,
  theme: ReturnType<typeof useTheme>
): string => {
  if (disabled) {
    return theme.colors.mutedForeground;
  }
  if (isHighlighted) {
    return theme.colors.primary;
  }
  return theme.colors.foreground;
};

export const RadioGroup = <T = string,>({
  options,
  value: controlledValue,
  defaultValue,
  onValueChange,
  onChange,
  name,
  cursor,
  id,
  autoFocus = false,
  isActive = true,
  disabled = false,
  "aria-label": ariaLabel,
}: RadioGroupProps<T>) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedCursor = cursor ?? resolveTerminalSymbol(unicode, "›", ">");
  const [activeIndex, setActiveIndex] = useState(() => {
    if (controlledValue === undefined) {
      return 0;
    }
    const idx = options.findIndex((o) => o.value === controlledValue);
    return Math.max(idx, 0);
  });
  const [internalValue, setInternalValue] = useState<T | undefined>(
    defaultValue
  );

  const selected = controlledValue ?? internalValue;

  const select = (idx: number) => {
    const opt = options[idx];
    if (!opt || opt.disabled) {
      return;
    }
    if (controlledValue === undefined) {
      setInternalValue(opt.value);
    }
    (onValueChange ?? onChange)?.(opt.value);
  };

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
      } else if (input === " " || key.return) {
        select(activeIndex);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  return (
    <Box
      aria-role="radiogroup"
      aria-state={{ disabled }}
      flexDirection="column"
    >
      <Text
        aria-label={ariaLabel ?? name ?? "Radio group"}
        bold={Boolean(name)}
      >
        {name ?? ""}
      </Text>
      {options.map((opt, idx) => {
        const isActive = idx === activeIndex;
        const isSelected = selected !== undefined && opt.value === selected;
        const icon = isSelected
          ? resolveTerminalSymbol(unicode, "◉", "(*)")
          : resolveTerminalSymbol(unicode, "○", "( )");

        return (
          <Box
            key={idx}
            aria-label={opt.hint ? `${opt.label}: ${opt.hint}` : opt.label}
            aria-role="radio"
            aria-state={{
              checked: isSelected,
              disabled: disabled || opt.disabled,
            }}
            gap={1}
          >
            <Text
              aria-hidden
              color={isActive ? theme.colors.primary : undefined}
            >
              {isFocused && isActive ? resolvedCursor : " "}
            </Text>
            <Text
              aria-hidden
              color={getOptionColor(opt.disabled, isSelected, theme)}
              dimColor={opt.disabled}
            >
              {icon}
            </Text>
            <Text
              aria-hidden
              color={getOptionColor(opt.disabled, isActive, theme)}
              bold={(isFocused && isActive) || isSelected}
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
