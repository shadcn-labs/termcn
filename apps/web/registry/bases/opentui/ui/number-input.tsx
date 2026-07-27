/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import type { BorderStyle } from "@/registry/bases/opentui/ui/types";

export interface NumberInputProps {
  value?: number;
  onChange?: (value: number) => void;
  onSubmit?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  label?: string;
  id?: string;
  format?: (n: number) => string;
  borderStyle?: BorderStyle;
  paddingX?: number;
  cursor?: string;
  stepHint?: string;
}

export const NumberInput = ({
  value: controlledValue,
  onChange,
  onSubmit,
  min,
  max,
  step = 1,
  placeholder = "",
  label,
  id: _id,
  format,
  borderStyle = "rounded",
  paddingX = 1,
  cursor = "█",
  stepHint,
}: NumberInputProps) => {
  const [internalValue, setInternalValue] = useState<number | undefined>();
  const [buffer, setBuffer] = useState<string>("");
  const theme = useTheme();
  const [isFocused] = useState(true);

  const value = controlledValue ?? internalValue;

  const clamp = (n: number): number => {
    let result = n;
    if (min !== undefined) {
      result = Math.max(min, result);
    }
    if (max !== undefined) {
      result = Math.min(max, result);
    }
    return result;
  };

  const applyValue = (clamped: number) => {
    if (onChange) {
      onChange(clamped);
    } else {
      setInternalValue(clamped);
    }
  };

  const commitValue = (n: number) => {
    const clamped = clamp(n);
    applyValue(clamped);
    setBuffer(String(clamped));
  };

  useKeyboard((key) => {
    if (!isFocused) {
      return;
    }
    if (key.name === "up") {
      const current = value ?? 0;
      commitValue(current + step);
      return;
    }
    if (key.name === "down") {
      const current = value ?? 0;
      commitValue(current - step);
      return;
    }
    if (key.name === "return") {
      const parsed = buffer === "" ? value : Number.parseFloat(buffer);
      if (parsed !== undefined && !Number.isNaN(parsed)) {
        const clamped = clamp(parsed);
        onSubmit?.(clamped);
      }
      return;
    }
    if (key.name === "backspace" || key.name === "delete") {
      const newBuffer = buffer.slice(0, -1);
      setBuffer(newBuffer);
      if (newBuffer === "" || newBuffer === "-") {
        return;
      }
      const parsed = Number.parseFloat(newBuffer);
      if (!Number.isNaN(parsed)) {
        applyValue(clamp(parsed));
      }
      return;
    }
    if (key.name === "escape" || key.name === "tab") {
      return;
    }
    if (key.name && /^[\d.-]$/.test(key.name)) {
      if (key.name === "-" && buffer.length > 0) {
        return;
      }
      if (key.name === "." && buffer.includes(".")) {
        return;
      }
      const newBuffer = buffer + key.name;
      setBuffer(newBuffer);
      const parsed = Number.parseFloat(newBuffer);
      if (!Number.isNaN(parsed)) {
        applyValue(clamp(parsed));
      }
    }
  });

  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;

  let displayValue = "";
  if (isFocused && buffer !== "") {
    displayValue = buffer;
  } else if (value !== undefined) {
    displayValue = format ? format(value) : String(value);
  }

  const resolvedStepHint = stepHint ?? `↑ +${step}  ↓ -${step}`;

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
        >
          <text
            fg={
              displayValue
                ? theme.colors.foreground
                : theme.colors.mutedForeground
            }
          >
            {displayValue || placeholder}
          </text>
          {isFocused && <text fg={theme.colors.focusRing}>{cursor}</text>}
        </box>
        {isFocused && (
          <text fg={theme.colors.mutedForeground}>{resolvedStepHint}</text>
        )}
      </box>
    </box>
  );
};
