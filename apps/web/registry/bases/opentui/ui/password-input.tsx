/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import type { BorderStyle } from "@/registry/bases/opentui/ui/types";

export interface PasswordInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  mask?: string;
  showToggle?: boolean;
  label?: string;
  id?: string;
  borderStyle?: BorderStyle;
  paddingX?: number;
  width?: number;
  cursor?: string;
}

export const PasswordInput = ({
  value: controlledValue,
  onChange,
  onSubmit,
  placeholder = "",
  mask = "●",
  showToggle = false,
  label,
  id: _id,
  borderStyle = "rounded",
  paddingX = 1,
  width,
  cursor = "█",
}: PasswordInputProps) => {
  const [internalValue, setInternalValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();
  const [isFocused] = useState(true);

  const value = controlledValue ?? internalValue;

  const setValue = (newVal: string) => {
    if (onChange) {
      onChange(newVal);
    } else {
      setInternalValue(newVal);
    }
  };

  useKeyboard((key) => {
    if (!isFocused) {
      return;
    }
    if (showToggle && key.ctrl && key.name === "h") {
      setIsVisible((v) => !v);
      return;
    }
    if (key.name === "return") {
      onSubmit?.(value);
      return;
    }
    if (key.name === "backspace" || key.name === "delete") {
      setValue(value.slice(0, -1));
      return;
    }
    if (
      key.name === "escape" ||
      key.name === "up" ||
      key.name === "down" ||
      key.name === "tab"
    ) {
      return;
    }
    if (key.name && key.name.length === 1) {
      setValue(value + key.name);
    }
  });

  const displayValue = isVisible ? value : mask.repeat(value.length);
  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;

  return (
    <box flexDirection="column">
      {label && (
        <text>
          <b>{label}</b>
        </text>
      )}
      <box flexDirection="row" alignItems="center" gap={1}>
        <box
          borderStyle={borderStyle}
          borderColor={borderColor}
          paddingLeft={paddingX}
          paddingRight={paddingX}
          width={width}
        >
          <text
            fg={value ? theme.colors.foreground : theme.colors.mutedForeground}
          >
            {displayValue || placeholder}
          </text>
          {isFocused && <text fg={theme.colors.focusRing}>{cursor}</text>}
        </box>
        {showToggle && isFocused && (
          <text fg={theme.colors.mutedForeground}>
            {isVisible ? "Ctrl+H hide" : "Ctrl+H show"}
          </text>
        )}
      </box>
    </box>
  );
};
