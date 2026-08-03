/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import { useInputPaste } from "@/registry/bases/opentui/lib/input-paste";
import {
  decodePaste,
  getKeyText,
  toSingleLine,
} from "@/registry/bases/opentui/lib/input-utils";
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
  autoFocus?: boolean;
  focused?: boolean;
  isDisabled?: boolean;
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
  autoFocus = false,
  focused,
  isDisabled = false,
  id,
  format,
  borderStyle = "rounded",
  paddingX = 1,
  cursor = "█",
  stepHint,
}: NumberInputProps) => {
  const [internalValue, setInternalValue] = useState<number | undefined>();
  const [buffer, setBuffer] = useState<string>(() =>
    controlledValue === undefined ? "" : String(controlledValue)
  );
  const theme = useTheme();
  const isFocused = !isDisabled && (focused ?? autoFocus);

  const value = controlledValue ?? internalValue;

  useEffect(() => {
    if (controlledValue !== undefined) {
      setBuffer(String(controlledValue));
    }
  }, [controlledValue]);

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
    if (controlledValue === undefined) {
      setInternalValue(clamped);
    }
    onChange?.(clamped);
  };

  const commitValue = (n: number) => {
    const clamped = clamp(n);
    applyValue(clamped);
    setBuffer(String(clamped));
  };

  const insertNumberText = (input: string) => {
    const newBuffer = buffer + input;
    if (!/^-?(?:\d+\.?\d*|\.\d*)?$/u.test(newBuffer)) {
      return;
    }
    setBuffer(newBuffer);
    if (newBuffer === "" || newBuffer === "-" || newBuffer === ".") {
      return;
    }
    const parsed = Number.parseFloat(newBuffer);
    if (!Number.isNaN(parsed)) {
      applyValue(clamp(parsed));
    }
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
        if (controlledValue === undefined) {
          setInternalValue(undefined);
        }
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
    insertNumberText(getKeyText(key));
  });

  useInputPaste((event) => {
    if (!isFocused) {
      return;
    }
    const input = toSingleLine(decodePaste(event.bytes));
    if (!input) {
      return;
    }
    const nextBuffer = buffer + input;
    if (!/^-?(?:\d+\.?\d*|\.\d*)?$/u.test(nextBuffer)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    insertNumberText(input);
  });

  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;

  let displayValue = "";
  if (isFocused) {
    displayValue = buffer;
  } else if (value !== undefined) {
    displayValue = format ? format(value) : String(value);
  }

  const resolvedStepHint = stepHint ?? `↑ +${step}  ↓ -${step}`;

  return (
    <box id={id} flexDirection="column">
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
