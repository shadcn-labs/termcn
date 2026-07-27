import { Box, Text } from "ink";
import React, { useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import {
  resolveBorderStyle,
  resolveTerminalSymbol,
} from "@/registry/bases/ink/lib/accessibility";

export interface MaskedInputProps {
  mask: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  id?: string;
  width?: number;
  isActive?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  "aria-label"?: string;
}

/**
 * Returns true if the literal at `pos` "closes" a digit group, meaning there
 * exists a literal at some position j < pos such that every character strictly
 * between j and pos is '#'.  e.g. ')' at position 4 in '(###) ###-####'.
 */
const isClosingLiteral = (mask: string, pos: number): boolean => {
  for (let j = pos - 1; j >= 0; j -= 1) {
    if (mask[j] === "#") {
      continue;
    }
    const between = mask.slice(j + 1, pos);
    return between.length > 0 && [...between].every((c) => c === "#");
  }
  return false;
};

/**
 * Apply a mask to raw digits. '#' in the mask is a digit placeholder.
 * Returns the formatted display string.
 */
const applyMask = (raw: string, mask: string): string => {
  let rawIdx = 0;
  let result = "";

  for (let i = 0; i < mask.length; i += 1) {
    const maskChar = mask[i];

    if (rawIdx >= raw.length) {
      if (maskChar !== "#" && isClosingLiteral(mask, i)) {
        result += maskChar;
      }
      break;
    }

    if (maskChar === "#") {
      result += raw[rawIdx];
      rawIdx += 1;
    } else if (mask.includes("#", i + 1)) {
      result += maskChar;
    }
  }

  return result;
};

const maxDigits = (mask: string): number =>
  [...mask].filter((c) => c === "#").length;

export const MaskedInput = ({
  mask,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onChange,
  onSubmit,
  label,
  placeholder,
  autoFocus = false,
  id,
  width = 40,
  isActive = true,
  disabled = false,
  readOnly = false,
  required = false,
  "aria-label": ariaLabel,
}: MaskedInputProps) => {
  const unicode = useUnicode();
  const cursor = resolveTerminalSymbol(unicode, "█", "|");
  const [internalValue, setInternalValue] = useState(defaultValue);
  const theme = useTheme();

  const raw = controlledValue ?? internalValue;
  const max = maxDigits(mask);
  const applyChange = (nextValue: string) => {
    const changeHandler = onValueChange ?? onChange;
    if (changeHandler) {
      changeHandler(nextValue);
    } else {
      setInternalValue(nextValue);
    }
  };

  const { isFocused } = useInteraction(
    (input, key) => {
      if (key.return) {
        onSubmit?.(raw);
        return;
      }

      if (readOnly) {
        return;
      }

      if (key.backspace) {
        applyChange(raw.slice(0, -1));
        return;
      }

      if (key.escape || key.upArrow || key.downArrow || key.tab) {
        return;
      }

      const insertedDigits = input.replaceAll(/\D/g, "");
      if (insertedDigits && raw.length < max) {
        applyChange((raw + insertedDigits).slice(0, max));
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const display = raw.length > 0 ? applyMask(raw, mask) : "";
  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;

  const remainingMask = mask.slice(display.length);

  const displayPlaceholder = placeholder ? (
    <Text aria-hidden color={theme.colors.mutedForeground}>
      {placeholder}
    </Text>
  ) : null;

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box
        aria-label={
          ariaLabel ?? `${label ?? "Masked input"}: ${display || "empty"}`
        }
        aria-role="textbox"
        aria-state={{ disabled, readonly: readOnly, required }}
        borderStyle={resolveBorderStyle("round", unicode)}
        borderColor={borderColor}
        width={width}
        paddingX={1}
      >
        {display.length > 0 ? (
          <Text aria-hidden color={theme.colors.foreground}>
            {display}
          </Text>
        ) : (
          displayPlaceholder
        )}
        {isFocused && display.length < mask.length && (
          <Text aria-hidden color={theme.colors.focusRing}>
            {cursor}
          </Text>
        )}
        {display.length > 0 && display.length < mask.length && (
          <Text aria-hidden color={theme.colors.mutedForeground} dimColor>
            {remainingMask}
          </Text>
        )}
      </Box>
    </Box>
  );
};
