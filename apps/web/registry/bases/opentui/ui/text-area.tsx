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

export interface TextAreaProps extends InteractionProps {
  borderStyle?: BorderStyle;
  cursor?: string;
  defaultValue?: string;
  label?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onValueChange?: (value: string) => void;
  paddingX?: number;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  value?: string;
}

const getLines = (value: string): string[] => value.split("\n");

const joinLines = (lines: string[]): string => lines.join("\n");

const decodePaste = (event: PasteEventLike): string =>
  new TextDecoder().decode(event.bytes).replaceAll("\r\n", "\n");

export const TextArea = ({
  autoFocus = false,
  borderStyle = "rounded",
  cursor = "█",
  defaultValue = "",
  disabled = false,
  id,
  isActive = true,
  label,
  onChange,
  onSubmit,
  onValueChange,
  paddingX = 1,
  placeholder = "",
  readOnly = false,
  rows = 4,
  value: controlledValue,
}: TextAreaProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [cursorLine, setCursorLine] = useState(0);
  const [cursorCol, setCursorCol] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const theme = useTheme();
  const value = controlledValue ?? internalValue;
  const viewportRows = Math.max(1, rows);

  useEffect(() => {
    const lines = getLines(value);
    const nextLine = Math.min(cursorLine, lines.length - 1);
    const nextCol = Math.min(cursorCol, (lines[nextLine] ?? "").length);
    if (nextLine !== cursorLine) {
      setCursorLine(nextLine);
    }
    if (nextCol !== cursorCol) {
      setCursorCol(nextCol);
    }
    if (scrollOffset > nextLine) {
      setScrollOffset(nextLine);
    }
  }, [cursorCol, cursorLine, scrollOffset, value]);

  const setValue = (next: string) => {
    if (controlledValue === undefined) {
      setInternalValue(next);
    }
    if (onValueChange) {
      onValueChange(next);
    } else {
      onChange?.(next);
    }
  };

  const moveToLine = (line: number, column = cursorCol) => {
    const lines = getLines(value);
    const nextLine = Math.max(0, Math.min(line, lines.length - 1));
    setCursorLine(nextLine);
    setCursorCol(Math.min(column, (lines[nextLine] ?? "").length));
    if (nextLine < scrollOffset) {
      setScrollOffset(nextLine);
    } else if (nextLine >= scrollOffset + viewportRows) {
      setScrollOffset(nextLine - viewportRows + 1);
    }
  };

  const insert = (text: string) => {
    if (readOnly || !text) {
      return;
    }
    const lines = getLines(value);
    const currentLine = lines[cursorLine] ?? "";
    const inserted = text.split("\n");
    const before = currentLine.slice(0, cursorCol);
    const after = currentLine.slice(cursorCol);
    const replacement =
      inserted.length === 1
        ? [before + inserted[0] + after]
        : [
            before + inserted[0],
            ...inserted.slice(1, -1),
            (inserted.at(-1) ?? "") + after,
          ];
    const nextLines = [
      ...lines.slice(0, cursorLine),
      ...replacement,
      ...lines.slice(cursorLine + 1),
    ];
    const nextLine = cursorLine + inserted.length - 1;
    const nextCol =
      inserted.length === 1
        ? cursorCol + inserted[0].length
        : (inserted.at(-1) ?? "").length;
    setValue(joinLines(nextLines));
    setCursorLine(nextLine);
    setCursorCol(nextCol);
    if (nextLine >= scrollOffset + viewportRows) {
      setScrollOffset(nextLine - viewportRows + 1);
    }
  };

  const { interactionProps, isFocused } = useInteraction({
    autoFocus,
    disabled,
    id,
    isActive,
    onInput: (key) => {
      const lines = getLines(value);
      const currentLine = lines[cursorLine] ?? "";
      if ((key.name === "return" || key.name === "enter") && key.ctrl) {
        onSubmit?.(value);
        return;
      }
      if (key.name === "left") {
        if (cursorCol > 0) {
          setCursorCol(cursorCol - 1);
        } else if (cursorLine > 0) {
          moveToLine(cursorLine - 1, (lines[cursorLine - 1] ?? "").length);
        }
        return;
      }
      if (key.name === "right") {
        if (cursorCol < currentLine.length) {
          setCursorCol(cursorCol + 1);
        } else if (cursorLine < lines.length - 1) {
          moveToLine(cursorLine + 1, 0);
        }
        return;
      }
      if (key.name === "up") {
        moveToLine(cursorLine - 1);
        return;
      }
      if (key.name === "down") {
        moveToLine(cursorLine + 1);
        return;
      }
      if (key.name === "home") {
        setCursorCol(0);
        return;
      }
      if (key.name === "end") {
        setCursorCol(currentLine.length);
        return;
      }
      if (readOnly) {
        return;
      }
      if (key.name === "return" || key.name === "enter") {
        insert("\n");
        return;
      }
      if (key.name === "backspace") {
        if (cursorCol > 0) {
          const nextLine =
            currentLine.slice(0, cursorCol - 1) + currentLine.slice(cursorCol);
          const nextLines = [...lines];
          nextLines[cursorLine] = nextLine;
          setValue(joinLines(nextLines));
          setCursorCol(cursorCol - 1);
        } else if (cursorLine > 0) {
          const previousLine = lines[cursorLine - 1] ?? "";
          const nextLines = [
            ...lines.slice(0, cursorLine - 1),
            previousLine + currentLine,
            ...lines.slice(cursorLine + 1),
          ];
          setValue(joinLines(nextLines));
          moveToLine(cursorLine - 1, previousLine.length);
        }
        return;
      }
      if (key.name === "delete") {
        if (cursorCol < currentLine.length) {
          const nextLines = [...lines];
          nextLines[cursorLine] =
            currentLine.slice(0, cursorCol) + currentLine.slice(cursorCol + 1);
          setValue(joinLines(nextLines));
        } else if (cursorLine < lines.length - 1) {
          const nextLines = [
            ...lines.slice(0, cursorLine),
            currentLine + (lines[cursorLine + 1] ?? ""),
            ...lines.slice(cursorLine + 2),
          ];
          setValue(joinLines(nextLines));
        }
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
        insert(pasted);
      }
    },
  });

  const borderColor = disabled
    ? theme.colors.muted
    : isFocused
      ? theme.colors.focusRing
      : theme.colors.border;
  const textColor = disabled
    ? theme.colors.mutedForeground
    : theme.colors.foreground;
  const lines = getLines(value);
  const visibleLines = lines.slice(scrollOffset, scrollOffset + viewportRows);
  const paddedLines = [...visibleLines];
  while (paddedLines.length < viewportRows) {
    paddedLines.push("");
  }
  const isEmpty = value.length === 0;

  return (
    <box flexDirection="column">
      {label && (
        <text fg={disabled ? theme.colors.mutedForeground : undefined}>
          <b>{label}</b>
        </text>
      )}
      <box
        {...interactionProps}
        flexDirection="column"
        borderStyle={borderStyle}
        borderColor={borderColor}
        paddingLeft={paddingX}
        paddingRight={paddingX}
      >
        {paddedLines.map((line, rowIndex) => {
          const absoluteLineIndex = rowIndex + scrollOffset;
          const isActiveLine =
            isFocused && !disabled && absoluteLineIndex === cursorLine;
          if (isEmpty && rowIndex === 0) {
            return (
              <box key={rowIndex} flexDirection="row">
                <text fg={theme.colors.mutedForeground}>{placeholder}</text>
                {isActiveLine && (
                  <text fg={theme.colors.focusRing}>{cursor}</text>
                )}
              </box>
            );
          }
          if (isActiveLine) {
            const before = line.slice(0, cursorCol);
            const after = line.slice(cursorCol);
            return (
              <box key={rowIndex} flexDirection="row">
                <text fg={textColor}>{before}</text>
                <text fg={theme.colors.focusRing}>{cursor}</text>
                <text fg={textColor}>{after}</text>
              </box>
            );
          }
          return (
            <box key={rowIndex}>
              <text fg={textColor}>{line}</text>
            </box>
          );
        })}
      </box>
    </box>
  );
};
