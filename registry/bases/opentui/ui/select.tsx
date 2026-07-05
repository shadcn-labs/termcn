/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface SelectOption<T = string> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export interface SelectProps<T = string> {
  options: SelectOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  onSubmit?: (value: T) => void;
  label?: string;
  cursor?: string;
  cursorColor?: string;
}

export const Select = <T = string,>({
  options,
  value: controlledValue,
  onChange,
  onSubmit,
  label,
  cursor = "›",
  cursorColor,
}: SelectProps<T>) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  const resolvedCursorColor = cursorColor ?? theme.colors.primary;

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
    } else if (key.name === "return") {
      const opt = options[activeIndex];
      if (opt && !opt.disabled) {
        onChange?.(opt.value);
        onSubmit?.(opt.value);
      }
    }
  });

  return (
    <box flexDirection="column">
      {label && (
        <text>
          <b>{label}</b>
        </text>
      )}
      {options.map((opt, idx) => {
        const isActive = idx === activeIndex;
        const isSelected =
          controlledValue !== undefined && opt.value === controlledValue;
        let optColor: string;
        if (opt.disabled) {
          optColor = theme.colors.mutedForeground;
        } else if (isActive) {
          optColor = resolvedCursorColor;
        } else {
          optColor = theme.colors.foreground;
        }
        return (
          <box key={idx} gap={1}>
            <text fg={isActive ? resolvedCursorColor : undefined}>
              {isActive ? cursor : " "}
            </text>
            <text fg={opt.disabled ? "#666" : optColor}>
              {isActive || isSelected ? <b>{opt.label}</b> : opt.label}
            </text>
            {opt.hint && <text fg="#666">{opt.hint}</text>}
          </box>
        );
      })}
    </box>
  );
};
