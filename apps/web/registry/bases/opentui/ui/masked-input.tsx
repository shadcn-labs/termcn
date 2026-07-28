/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import { useInputPaste } from "@/registry/bases/opentui/lib/input-paste";
import {
  decodePaste,
  getKeyText,
} from "@/registry/bases/opentui/lib/input-utils";

export interface MaskedInputProps {
  mask: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  focused?: boolean;
  isDisabled?: boolean;
  id?: string;
  width?: number;
}

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
  onChange,
  onSubmit,
  label,
  placeholder,
  autoFocus = false,
  focused,
  isDisabled = false,
  id,
  width = 40,
}: MaskedInputProps) => {
  const [internalValue, setInternalValue] = useState("");
  const theme = useTheme();
  const isFocused = !isDisabled && (focused ?? autoFocus);

  const raw = controlledValue ?? internalValue;
  const max = maxDigits(mask);

  const setValue = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const insertDigits = (input: string) => {
    const available = max - raw.length;
    const digits = [...input].filter((character) => /\d/u.test(character));
    const inserted = digits.slice(0, available).join("");
    if (inserted) {
      setValue(raw + inserted);
    }
  };

  useKeyboard((key) => {
    if (!isFocused) {
      return;
    }
    if (key.name === "return") {
      onSubmit?.(raw);
      return;
    }
    if (key.name === "backspace" || key.name === "delete") {
      setValue(raw.slice(0, -1));
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
    insertDigits(getKeyText(key));
  });

  useInputPaste((event) => {
    if (!isFocused) {
      return;
    }
    const input = decodePaste(event.bytes);
    if (![...input].some((character) => /\d/u.test(character))) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    insertDigits(input);
  });

  const display = raw.length > 0 ? applyMask(raw, mask) : "";
  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;

  const remainingMask = mask.slice(display.length);

  return (
    <box id={id} flexDirection="column">
      {label && (
        <text>
          <b>{label}</b>
        </text>
      )}
      <box
        borderStyle="rounded"
        borderColor={borderColor}
        width={width}
        paddingLeft={1}
        paddingRight={1}
      >
        {display.length > 0 ? (
          <text fg={theme.colors.foreground}>{display}</text>
        ) : placeholder ? (
          <text fg={theme.colors.mutedForeground}>{placeholder}</text>
        ) : null}
        {isFocused && display.length < mask.length && (
          <text fg={theme.colors.focusRing}>█</text>
        )}
        {display.length > 0 && display.length < mask.length && (
          <text fg={theme.colors.mutedForeground}>{remainingMask}</text>
        )}
      </box>
    </box>
  );
};
