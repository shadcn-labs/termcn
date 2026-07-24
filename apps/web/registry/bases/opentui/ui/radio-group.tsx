/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface RadioOption<T = string> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T = string> {
  options: RadioOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  name?: string;
  cursor?: string;
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
  onChange,
  name: _name,
  cursor = "›",
}: RadioGroupProps<T>) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(() => {
    if (controlledValue === undefined) {
      return 0;
    }
    const idx = options.findIndex((o) => o.value === controlledValue);
    return Math.max(idx, 0);
  });
  const [internalValue, setInternalValue] = useState<T | undefined>(
    controlledValue
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
    onChange?.(opt.value);
  };

  useKeyboard((key) => {
    if (key.name === "up") {
      setActiveIndex((i) => {
        let next = i - 1;
        while (next >= 0 && options[next]?.disabled) {
          next -= 1;
        }
        return next < 0 ? i : next;
      });
    } else if (key.name === "down") {
      setActiveIndex((i) => {
        let next = i + 1;
        while (next < options.length && options[next]?.disabled) {
          next += 1;
        }
        return next >= options.length ? i : next;
      });
    } else if (key.name === " " || key.name === "return") {
      select(activeIndex);
    }
  });

  return (
    <box flexDirection="column">
      {options.map((opt, idx) => {
        const isActive = idx === activeIndex;
        const isSelected = selected !== undefined && opt.value === selected;
        const icon = isSelected ? "◉" : "○";
        return (
          <box key={idx} gap={1}>
            <text fg={isActive ? theme.colors.primary : undefined}>
              {isActive ? cursor : " "}
            </text>
            <text
              fg={
                opt.disabled
                  ? "#666"
                  : getOptionColor(opt.disabled, isSelected, theme)
              }
            >
              {icon}
            </text>
            <text
              fg={
                opt.disabled
                  ? "#666"
                  : getOptionColor(opt.disabled, isActive, theme)
              }
            >
              {isActive || isSelected ? <b>{opt.label}</b> : opt.label}
            </text>
            {opt.hint && <text fg="#666">{opt.hint}</text>}
          </box>
        );
      })}
    </box>
  );
};
