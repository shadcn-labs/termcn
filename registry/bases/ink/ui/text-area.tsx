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
  removeGraphemeAt,
  removeGraphemeBefore,
  sliceGraphemes,
} from "@/registry/bases/ink/lib/terminal-text";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface TextAreaProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  rows?: number;
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
  cursor?: string;
}

const getLines = (value: string): string[] => value.split("\n");
const joinLines = (lines: readonly string[]): string => lines.join("\n");

export const TextArea = ({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onChange,
  onSubmit,
  placeholder = "",
  rows = 4,
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
  cursor,
}: TextAreaProps) => {
  const unicode = useUnicode();
  const resolvedCursor = cursor ?? resolveTerminalSymbol(unicode, "█", "|");
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [cursorLine, setCursorLine] = useState(0);
  const [cursorColumn, setCursorColumn] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const theme = useTheme();
  const { setCursorPosition } = useCursor();
  const value = controlledValue ?? internalValue;

  const setValue = (nextValue: string) => {
    const changeHandler = onValueChange ?? onChange;
    if (changeHandler) {
      changeHandler(nextValue);
    } else {
      setInternalValue(nextValue);
    }
  };

  const keepLineVisible = (line: number) => {
    if (line < scrollOffset) {
      setScrollOffset(line);
    } else if (line >= scrollOffset + rows) {
      setScrollOffset(line - rows + 1);
    }
  };

  const { isFocused } = useInteraction(
    (input, key) => {
      const lines = getLines(value);
      const currentLine = lines[cursorLine] ?? "";
      const currentLength = graphemeLength(currentLine);

      if (key.ctrl && key.return) {
        onSubmit?.(value);
        return;
      }

      if (key.escape || key.tab) {
        return;
      }

      if (key.leftArrow) {
        if (cursorColumn > 0) {
          setCursorColumn(cursorColumn - 1);
        } else if (cursorLine > 0) {
          const nextLine = cursorLine - 1;
          setCursorLine(nextLine);
          setCursorColumn(graphemeLength(lines[nextLine] ?? ""));
          keepLineVisible(nextLine);
        }
        return;
      }

      if (key.rightArrow) {
        if (cursorColumn < currentLength) {
          setCursorColumn(cursorColumn + 1);
        } else if (cursorLine < lines.length - 1) {
          const nextLine = cursorLine + 1;
          setCursorLine(nextLine);
          setCursorColumn(0);
          keepLineVisible(nextLine);
        }
        return;
      }

      if (key.upArrow || key.downArrow) {
        const direction = key.upArrow ? -1 : 1;
        const nextLine = Math.max(
          0,
          Math.min(cursorLine + direction, lines.length - 1)
        );
        setCursorLine(nextLine);
        setCursorColumn(
          Math.min(cursorColumn, graphemeLength(lines[nextLine] ?? ""))
        );
        keepLineVisible(nextLine);
        return;
      }

      if (key.home) {
        setCursorColumn(0);
        return;
      }

      if (key.end) {
        setCursorColumn(currentLength);
        return;
      }

      if (readOnly) {
        return;
      }

      if (key.return) {
        const before = sliceGraphemes(currentLine, 0, cursorColumn);
        const after = sliceGraphemes(currentLine, cursorColumn);
        const nextLines = [
          ...lines.slice(0, cursorLine),
          before,
          after,
          ...lines.slice(cursorLine + 1),
        ];
        const nextLine = cursorLine + 1;
        setValue(joinLines(nextLines));
        setCursorLine(nextLine);
        setCursorColumn(0);
        keepLineVisible(nextLine);
        return;
      }

      if (key.backspace) {
        if (cursorColumn > 0) {
          const result = removeGraphemeBefore(currentLine, cursorColumn);
          const nextLines = [...lines];
          nextLines[cursorLine] = result.value;
          setValue(joinLines(nextLines));
          setCursorColumn(result.cursor);
        } else if (cursorLine > 0) {
          const previousLine = lines[cursorLine - 1] ?? "";
          const nextLines = [
            ...lines.slice(0, cursorLine - 1),
            previousLine + currentLine,
            ...lines.slice(cursorLine + 1),
          ];
          const nextLine = cursorLine - 1;
          setValue(joinLines(nextLines));
          setCursorLine(nextLine);
          setCursorColumn(graphemeLength(previousLine));
          keepLineVisible(nextLine);
        }
        return;
      }

      if (key.delete) {
        if (cursorColumn < currentLength) {
          const result = removeGraphemeAt(currentLine, cursorColumn);
          const nextLines = [...lines];
          nextLines[cursorLine] = result.value;
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

      if (!input) {
        return;
      }

      const insertedLines = input.replaceAll("\r\n", "\n").split("\n");
      const before = sliceGraphemes(currentLine, 0, cursorColumn);
      const after = sliceGraphemes(currentLine, cursorColumn);

      if (insertedLines.length === 1) {
        const inserted = insertedLines[0] ?? "";
        const nextLines = [...lines];
        nextLines[cursorLine] = before + inserted + after;
        setValue(joinLines(nextLines));
        setCursorColumn(cursorColumn + graphemeLength(inserted));
        return;
      }

      const firstInserted = insertedLines[0] ?? "";
      const lastInserted = insertedLines.at(-1) ?? "";
      const replacement = [
        before + firstInserted,
        ...insertedLines.slice(1, -1),
        lastInserted + after,
      ];
      const nextLines = [
        ...lines.slice(0, cursorLine),
        ...replacement,
        ...lines.slice(cursorLine + 1),
      ];
      const nextLine = cursorLine + replacement.length - 1;
      setValue(joinLines(nextLines));
      setCursorLine(nextLine);
      setCursorColumn(graphemeLength(lastInserted));
      keepLineVisible(nextLine);
    },
    { autoFocus, disabled, id, isActive }
  );

  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;
  const lines = getLines(value);
  const visibleLines = lines.slice(scrollOffset, scrollOffset + rows);
  const paddedLines = [...visibleLines];
  while (paddedLines.length < rows) {
    paddedLines.push("");
  }

  const activeLine = lines[cursorLine] ?? "";
  const cursorRow = cursorLine - scrollOffset;
  const useNativeCursor = Boolean(
    cursorOrigin && isFocused && cursorRow >= 0 && cursorRow < rows
  );
  setCursorPosition(
    useNativeCursor && cursorOrigin
      ? {
          x: cursorOrigin.x + cursorCellOffset(activeLine, cursorColumn),
          y: cursorOrigin.y + cursorRow,
        }
      : undefined
  );

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box
        aria-label={ariaLabel ?? `${label ?? "Text area"}: ${value || "empty"}`}
        aria-role="textbox"
        aria-state={{
          disabled,
          multiline: true,
          readonly: readOnly,
          required,
        }}
        flexDirection="column"
        borderStyle={resolveBorderStyle(borderStyle, unicode)}
        borderColor={borderColor}
        paddingX={paddingX}
      >
        {paddedLines.map((line, rowIndex) => {
          const absoluteLineIndex = rowIndex + scrollOffset;
          const isActiveLine = isFocused && absoluteLineIndex === cursorLine;

          if (!value && rowIndex === 0) {
            return (
              <Box key={absoluteLineIndex} flexDirection="row">
                <Text color={theme.colors.mutedForeground}>{placeholder}</Text>
                {isFocused && !useNativeCursor && (
                  <Text color={theme.colors.focusRing}>{resolvedCursor}</Text>
                )}
              </Box>
            );
          }

          if (isActiveLine && !useNativeCursor) {
            return (
              <Box key={absoluteLineIndex} flexDirection="row">
                <Text color={theme.colors.foreground}>
                  {sliceGraphemes(line, 0, cursorColumn)}
                </Text>
                <Text color={theme.colors.focusRing}>{resolvedCursor}</Text>
                <Text color={theme.colors.foreground}>
                  {sliceGraphemes(line, cursorColumn)}
                </Text>
              </Box>
            );
          }

          return (
            <Box key={absoluteLineIndex}>
              <Text color={theme.colors.foreground}>{line}</Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
