/* @jsxImportSource @opentui/react */
import { useEffect, useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import {
  printableKey,
  useInteraction,
} from "@/registry/bases/opentui/hooks/use-interaction";
import type {
  InteractionProps,
  PasteEventLike,
} from "@/registry/bases/opentui/hooks/use-interaction";
import type { BorderStyle } from "@/registry/bases/opentui/ui/types";

export interface TextInputProps extends InteractionProps {
  bordered?: boolean;
  borderStyle?: BorderStyle;
  cursor?: string;
  defaultValue?: string;
  highlightPastedText?: boolean;
  label?: string;
  mask?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onValueChange?: (value: string) => void;
  paddingX?: number;
  placeholder?: string;
  readOnly?: boolean;
  showCursor?: boolean;
  validate?: (value: string) => string | null;
  value?: string;
  width?: number;
}

const decodePaste = (event: PasteEventLike): string =>
  new TextDecoder().decode(event.bytes).replaceAll(/\r?\n/g, " ");

export const TextInput = ({
  autoFocus = false,
  bordered = true,
  borderStyle = "rounded",
  cursor = "█",
  defaultValue = "",
  disabled = false,
  highlightPastedText = false,
  id,
  isActive = true,
  label,
  mask,
  onChange,
  onSubmit,
  onValueChange,
  paddingX = 1,
  placeholder = "",
  readOnly = false,
  showCursor = true,
  validate,
  value: controlledValue,
  width = 40,
}: TextInputProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [cursorOffset, setCursorOffset] = useState(defaultValue.length);
  const [cursorWidth, setCursorWidth] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const value = controlledValue ?? internalValue;

  useEffect(() => {
    if (cursorOffset > value.length) {
      setCursorOffset(value.length);
    }
  }, [cursorOffset, value.length]);

  const setValue = (next: string) => {
    if (controlledValue === undefined) {
      setInternalValue(next);
    }
    if (onValueChange) {
      onValueChange(next);
    } else {
      onChange?.(next);
    }
    if (error) {
      setError(null);
    }
  };

  const insert = (text: string, pasted = false) => {
    if (readOnly || !text) {
      return;
    }
    const next =
      value.slice(0, cursorOffset) + text + value.slice(cursorOffset);
    setValue(next);
    setCursorOffset(cursorOffset + text.length);
    setCursorWidth(pasted && highlightPastedText ? text.length : 0);
  };

  const submit = () => {
    const nextError = validate?.(value) ?? null;
    setError(nextError);
    if (!nextError) {
      onSubmit?.(value);
    }
  };

  const { interactionProps, isFocused } = useInteraction({
    autoFocus,
    disabled,
    id,
    isActive,
    onInput: (key) => {
      if (key.name === "return" || key.name === "enter") {
        submit();
        return;
      }
      if (key.name === "left") {
        setCursorOffset(Math.max(0, cursorOffset - 1));
        setCursorWidth(0);
        return;
      }
      if (key.name === "right") {
        setCursorOffset(Math.min(value.length, cursorOffset + 1));
        setCursorWidth(0);
        return;
      }
      if (key.name === "home") {
        setCursorOffset(0);
        setCursorWidth(0);
        return;
      }
      if (key.name === "end") {
        setCursorOffset(value.length);
        setCursorWidth(0);
        return;
      }
      if (readOnly) {
        return;
      }
      if (key.name === "backspace" && cursorOffset > 0) {
        setValue(value.slice(0, cursorOffset - 1) + value.slice(cursorOffset));
        setCursorOffset(cursorOffset - 1);
        setCursorWidth(0);
        return;
      }
      if (key.name === "delete" && cursorOffset < value.length) {
        setValue(value.slice(0, cursorOffset) + value.slice(cursorOffset + 1));
        setCursorWidth(0);
        return;
      }
      const text = printableKey(key);
      if (text) {
        insert(text);
      }
    },
    onPaste: (event) => {
      if (readOnly) {
        return;
      }
      const pasted = decodePaste(event);
      if (pasted) {
        event.preventDefault?.();
        insert(pasted, true);
      }
    },
  });

  const displayValue = mask ? mask.repeat(value.length) : value;
  const textColor = disabled
    ? theme.colors.mutedForeground
    : theme.colors.foreground;

  let borderColor = theme.colors.border;
  if (error) {
    borderColor = theme.colors.error;
  } else if (disabled) {
    borderColor = theme.colors.muted;
  } else if (isFocused) {
    borderColor = theme.colors.focusRing;
  }

  const pasteWidth = highlightPastedText ? cursorWidth : 0;

  const renderValue = () => {
    if (!value && placeholder) {
      if (showCursor && isFocused && !disabled) {
        return (
          <>
            <text fg={theme.colors.mutedForeground} reverse={true}>
              {placeholder[0] ?? " "}
            </text>
            <text fg={theme.colors.mutedForeground}>
              {placeholder.slice(1)}
            </text>
          </>
        );
      }
      return <text fg={theme.colors.mutedForeground}>{placeholder}</text>;
    }

    if (!showCursor || !isFocused || disabled) {
      return <text fg={textColor}>{displayValue}</text>;
    }

    const highlightStart = Math.max(0, cursorOffset - pasteWidth);
    const before = displayValue.slice(0, highlightStart);
    const highlighted = displayValue.slice(highlightStart, cursorOffset);
    const cursorChar =
      cursorOffset < displayValue.length ? displayValue[cursorOffset] : cursor;
    const after = displayValue.slice(cursorOffset + 1);

    return (
      <>
        {before && <text fg={textColor}>{before}</text>}
        {highlighted && (
          <text fg={textColor} reverse={true}>
            {highlighted}
          </text>
        )}
        <text reverse={true} fg={theme.colors.focusRing}>
          {cursorChar}
        </text>
        {after && <text fg={textColor}>{after}</text>}
      </>
    );
  };

  const boxProps = bordered
    ? {
        borderColor,
        borderStyle,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        width,
      }
    : { paddingLeft: paddingX, paddingRight: paddingX, width };

  return (
    <box flexDirection="column">
      {label && (
        <text fg={disabled ? theme.colors.mutedForeground : undefined}>
          <b>{label}</b>
        </text>
      )}
      <box {...interactionProps} {...boxProps}>
        {renderValue()}
      </box>
      {error && <text fg={theme.colors.error}>{error}</text>}
    </box>
  );
};
