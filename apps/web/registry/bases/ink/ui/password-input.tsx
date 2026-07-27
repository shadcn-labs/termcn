import { useCursor, Box, Text } from "ink";
import React, { useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import {
  resolveBorderStyle,
  resolveTerminalSymbol,
} from "@/registry/bases/ink/lib/accessibility";
import {
  cursorCellOffset,
  graphemeLength,
  removeGraphemeBefore,
} from "@/registry/bases/ink/lib/terminal-text";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface PasswordInputProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  mask?: string;
  showToggle?: boolean;
  label?: string;
  id?: string;
  autoFocus?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  "aria-label"?: string;
  cursorOrigin?: { x: number; y: number };
  borderStyle?: BorderStyle;
  paddingX?: number;
  width?: number;
  cursor?: string;
}

export const PasswordInput = ({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onChange,
  onSubmit,
  placeholder = "",
  mask,
  showToggle = false,
  label,
  id,
  autoFocus = false,
  isActive = true,
  disabled = false,
  readOnly = false,
  required = false,
  "aria-label": ariaLabel,
  cursorOrigin,
  borderStyle = "round",
  paddingX = 1,
  width,
  cursor,
}: PasswordInputProps) => {
  const unicode = useUnicode();
  const resolvedMask = mask ?? resolveTerminalSymbol(unicode, "●", "*");
  const resolvedCursor = cursor ?? resolveTerminalSymbol(unicode, "█", "|");
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();
  const { setCursorPosition } = useCursor();

  const value = controlledValue ?? internalValue;

  const setValue = (newVal: string) => {
    const changeHandler = onValueChange ?? onChange;
    if (changeHandler) {
      changeHandler(newVal);
    } else {
      setInternalValue(newVal);
    }
  };

  const { isFocused } = useInteraction(
    (input, key) => {
      if (showToggle && key.ctrl && input === "h") {
        setIsVisible((v) => !v);
        return;
      }

      if (key.return) {
        onSubmit?.(value);
        return;
      }

      if (readOnly) {
        return;
      }

      if (key.backspace) {
        setValue(removeGraphemeBefore(value, graphemeLength(value)).value);
        return;
      }

      if (key.escape || key.upArrow || key.downArrow || key.tab) {
        return;
      }

      if (input && input.length > 0) {
        setValue(value + input);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const valueLength = graphemeLength(value);
  const displayValue = isVisible ? value : resolvedMask.repeat(valueLength);
  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;
  const useNativeCursor = Boolean(cursorOrigin && isFocused);
  setCursorPosition(
    useNativeCursor && cursorOrigin
      ? {
          x: cursorOrigin.x + cursorCellOffset(displayValue, valueLength),
          y: cursorOrigin.y,
        }
      : undefined
  );

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box flexDirection="row" alignItems="center" gap={1}>
        <Text aria-hidden>{isFocused ? ">" : " "}</Text>
        <Box
          aria-label={
            ariaLabel ?? `${label ?? "Password"}: ${valueLength} characters`
          }
          aria-role="textbox"
          aria-state={{ disabled, readonly: readOnly, required }}
          borderStyle={resolveBorderStyle(borderStyle, unicode)}
          borderColor={borderColor}
          paddingX={paddingX}
          width={width}
        >
          <Text
            color={
              value ? theme.colors.foreground : theme.colors.mutedForeground
            }
          >
            {displayValue || placeholder}
          </Text>
          {isFocused && !useNativeCursor && (
            <Text aria-hidden color={theme.colors.focusRing}>
              {resolvedCursor}
            </Text>
          )}
        </Box>
        {showToggle && isFocused && (
          <Text color={theme.colors.mutedForeground}>
            {isVisible ? "Ctrl+H hide" : "Ctrl+H show"}
          </Text>
        )}
      </Box>
    </Box>
  );
};
