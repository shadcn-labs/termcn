import { Box, Text } from "ink";
import React, { useEffect, useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useFocus } from "@/hooks/use-focus";
import { useInput } from "@/hooks/use-input";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface TextAreaProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  autoFocus?: boolean;
  isDisabled?: boolean;
  id?: string;
  borderStyle?: BorderStyle;
  paddingX?: number;
  cursor?: string;
}

const getLines = (value: string): string[] => value.split("\n");

const joinLines = (lines: string[]): string => lines.join("\n");

const getEndPosition = (value: string) => {
  const lines = getLines(value);
  return {
    column: lines.at(-1)?.length ?? 0,
    line: Math.max(0, lines.length - 1),
  };
};

export const TextArea = ({
  value: controlledValue,
  onChange,
  onSubmit,
  placeholder = "",
  rows = 4,
  label,
  autoFocus = false,
  isDisabled = false,
  id,
  borderStyle = "round",
  paddingX = 1,
  cursor = "█",
}: TextAreaProps) => {
  const [internalValue, setInternalValue] = useState("");
  const initialCursor = getEndPosition(controlledValue ?? "");
  const [cursorLine, setCursorLine] = useState(initialCursor.line);
  const [cursorColumn, setCursorColumn] = useState(initialCursor.column);
  const [scrollOffset, setScrollOffset] = useState(0);
  const theme = useTheme();
  const { isFocused } = useFocus({
    autoFocus,
    id,
    isActive: !isDisabled,
  });
  const visibleRowCount = Math.max(1, rows);

  const value = controlledValue ?? internalValue;

  useEffect(() => {
    const lines = getLines(value);
    const nextLine = Math.min(cursorLine, Math.max(0, lines.length - 1));
    const nextColumn = Math.min(cursorColumn, lines[nextLine]?.length ?? 0);
    if (nextLine !== cursorLine) {
      setCursorLine(nextLine);
    }
    if (nextColumn !== cursorColumn) {
      setCursorColumn(nextColumn);
    }
  }, [cursorColumn, cursorLine, value]);

  const setValue = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const keepCursorVisible = (line: number) => {
    if (line < scrollOffset) {
      setScrollOffset(line);
    } else if (line >= scrollOffset + visibleRowCount) {
      setScrollOffset(line - visibleRowCount + 1);
    }
  };

  const insertText = (input: string) => {
    if (!input) {
      return;
    }

    const lines = getLines(value);
    const currentLine = lines[cursorLine] ?? "";
    const before = currentLine.slice(0, cursorColumn);
    const after = currentLine.slice(cursorColumn);
    const insertedLines = input
      .replaceAll("\r\n", "\n")
      .replaceAll("\r", "\n")
      .split("\n");

    let replacement: string[];
    let nextLine: number;
    let nextColumn: number;

    if (insertedLines.length === 1) {
      const inserted = insertedLines[0] ?? "";
      replacement = [before + inserted + after];
      nextLine = cursorLine;
      nextColumn = cursorColumn + inserted.length;
    } else {
      const first = insertedLines[0] ?? "";
      const last = insertedLines.at(-1) ?? "";
      replacement = [
        before + first,
        ...insertedLines.slice(1, -1),
        last + after,
      ];
      nextLine = cursorLine + insertedLines.length - 1;
      nextColumn = last.length;
    }

    setValue(
      joinLines([
        ...lines.slice(0, cursorLine),
        ...replacement,
        ...lines.slice(cursorLine + 1),
      ])
    );
    setCursorLine(nextLine);
    setCursorColumn(nextColumn);
    keepCursorVisible(nextLine);
  };

  useInput(
    (input, key) => {
      if (!isFocused) {
        return;
      }

      const lines = getLines(value);

      if (key.return && key.ctrl) {
        onSubmit?.(value);
        return;
      }

      if (key.return) {
        insertText("\n");
        return;
      }

      if (key.backspace) {
        const currentLine = lines[cursorLine] ?? "";
        if (cursorColumn > 0) {
          const newLine =
            currentLine.slice(0, cursorColumn - 1) +
            currentLine.slice(cursorColumn);
          setValue(
            joinLines([
              ...lines.slice(0, cursorLine),
              newLine,
              ...lines.slice(cursorLine + 1),
            ])
          );
          setCursorColumn(cursorColumn - 1);
        } else if (cursorLine > 0) {
          const previousLine = lines[cursorLine - 1] ?? "";
          setValue(
            joinLines([
              ...lines.slice(0, cursorLine - 1),
              previousLine + currentLine,
              ...lines.slice(cursorLine + 1),
            ])
          );
          const nextLine = cursorLine - 1;
          setCursorLine(nextLine);
          setCursorColumn(previousLine.length);
          keepCursorVisible(nextLine);
        }
        return;
      }

      if (key.delete) {
        const currentLine = lines[cursorLine] ?? "";
        if (cursorColumn < currentLine.length) {
          const newLine =
            currentLine.slice(0, cursorColumn) +
            currentLine.slice(cursorColumn + 1);
          setValue(
            joinLines([
              ...lines.slice(0, cursorLine),
              newLine,
              ...lines.slice(cursorLine + 1),
            ])
          );
        } else if (cursorLine < lines.length - 1) {
          const nextLine = lines[cursorLine + 1] ?? "";
          setValue(
            joinLines([
              ...lines.slice(0, cursorLine),
              currentLine + nextLine,
              ...lines.slice(cursorLine + 2),
            ])
          );
        }
        return;
      }

      if (key.leftArrow) {
        if (cursorColumn > 0) {
          setCursorColumn(cursorColumn - 1);
        } else if (cursorLine > 0) {
          const nextLine = cursorLine - 1;
          setCursorLine(nextLine);
          setCursorColumn((lines[nextLine] ?? "").length);
          keepCursorVisible(nextLine);
        }
        return;
      }

      if (key.rightArrow) {
        const currentLine = lines[cursorLine] ?? "";
        if (cursorColumn < currentLine.length) {
          setCursorColumn(cursorColumn + 1);
        } else if (cursorLine < lines.length - 1) {
          const nextLine = cursorLine + 1;
          setCursorLine(nextLine);
          setCursorColumn(0);
          keepCursorVisible(nextLine);
        }
        return;
      }

      if (key.upArrow && cursorLine > 0) {
        const nextLine = cursorLine - 1;
        setCursorLine(nextLine);
        setCursorColumn(Math.min(cursorColumn, (lines[nextLine] ?? "").length));
        keepCursorVisible(nextLine);
        return;
      }

      if (key.downArrow && cursorLine < lines.length - 1) {
        const nextLine = cursorLine + 1;
        setCursorLine(nextLine);
        setCursorColumn(Math.min(cursorColumn, (lines[nextLine] ?? "").length));
        keepCursorVisible(nextLine);
        return;
      }

      if (key.escape || key.tab) {
        return;
      }

      insertText(input);
    },
    { isActive: isFocused && !isDisabled }
  );

  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;
  const lines = getLines(value);
  const visibleLines = lines.slice(
    scrollOffset,
    scrollOffset + visibleRowCount
  );

  const paddedLines: string[] = [...visibleLines];
  while (paddedLines.length < visibleRowCount) {
    paddedLines.push("");
  }

  const isEmpty = value.length === 0;

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box
        flexDirection="column"
        borderStyle={borderStyle}
        borderColor={borderColor}
        paddingX={paddingX}
      >
        {paddedLines.map((line, rowIndex) => {
          const absoluteLine = rowIndex + scrollOffset;
          const isActiveLine = isFocused && absoluteLine === cursorLine;

          if (isEmpty && rowIndex === 0) {
            return (
              <Box key={rowIndex} flexDirection="row">
                <Text color={theme.colors.mutedForeground}>{placeholder}</Text>
                {isFocused && (
                  <Text color={theme.colors.focusRing}>{cursor}</Text>
                )}
              </Box>
            );
          }

          if (isActiveLine) {
            const before = line.slice(0, cursorColumn);
            const after = line.slice(cursorColumn);
            return (
              <Box key={rowIndex} flexDirection="row">
                <Text color={theme.colors.foreground}>{before}</Text>
                <Text color={theme.colors.focusRing}>{cursor}</Text>
                <Text color={theme.colors.foreground}>{after}</Text>
              </Box>
            );
          }

          return (
            <Box key={rowIndex}>
              <Text color={theme.colors.foreground}>{line}</Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
