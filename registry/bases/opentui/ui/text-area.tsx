/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import type { BorderStyle } from "@/components/ui/opentui-theme-provider";

export interface TextAreaProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  id?: string;
  borderStyle?: BorderStyle;
  paddingX?: number;
  cursor?: string;
}

const getLines = (v: string): string[] => v.split("\n");

const joinLines = (lines: string[]): string => lines.join("\n");

export const TextArea = ({
  value: controlledValue,
  onChange,
  onSubmit,
  placeholder = "",
  rows = 4,
  label,
  id: _id,
  borderStyle = "rounded",
  paddingX = 1,
  cursor = "█",
}: TextAreaProps) => {
  const [internalValue, setInternalValue] = useState("");
  const [cursorLine, setCursorLine] = useState(0);
  const [cursorCol, setCursorCol] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
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
    const lines = getLines(value);
    if (key.name === "return" && key.ctrl) {
      onSubmit?.(value);
      return;
    }
    if (key.name === "return") {
      const totalLines = lines.length;
      if (totalLines >= rows && cursorLine === rows - 1) {
        return;
      }
      const currentLine = lines[cursorLine] ?? "";
      const before = currentLine.slice(0, cursorCol);
      const after = currentLine.slice(cursorCol);
      const newLines = [
        ...lines.slice(0, cursorLine),
        before,
        after,
        ...lines.slice(cursorLine + 1),
      ];
      setValue(joinLines(newLines));
      const newLine = cursorLine + 1;
      setCursorLine(newLine);
      setCursorCol(0);
      if (newLine >= scrollOffset + rows) {
        setScrollOffset(newLine - rows + 1);
      }
      return;
    }
    if (key.name === "backspace" || key.name === "delete") {
      const currentLine = lines[cursorLine] ?? "";
      if (cursorCol > 0) {
        const newLine =
          currentLine.slice(0, cursorCol - 1) + currentLine.slice(cursorCol);
        const newLines = [
          ...lines.slice(0, cursorLine),
          newLine,
          ...lines.slice(cursorLine + 1),
        ];
        setValue(joinLines(newLines));
        setCursorCol(cursorCol - 1);
      } else if (cursorLine > 0) {
        const prevLine = lines[cursorLine - 1] ?? "";
        const mergedLine = prevLine + currentLine;
        const newLines = [
          ...lines.slice(0, cursorLine - 1),
          mergedLine,
          ...lines.slice(cursorLine + 1),
        ];
        setValue(joinLines(newLines));
        const newLineIdx = cursorLine - 1;
        setCursorLine(newLineIdx);
        setCursorCol(prevLine.length);
        if (newLineIdx < scrollOffset) {
          setScrollOffset(newLineIdx);
        }
      }
      return;
    }
    if (key.name === "left") {
      if (cursorCol > 0) {
        setCursorCol(cursorCol - 1);
      } else if (cursorLine > 0) {
        const prevLine = lines[cursorLine - 1] ?? "";
        const newLineIdx = cursorLine - 1;
        setCursorLine(newLineIdx);
        setCursorCol(prevLine.length);
        if (newLineIdx < scrollOffset) {
          setScrollOffset(newLineIdx);
        }
      }
      return;
    }
    if (key.name === "right") {
      const currentLine = lines[cursorLine] ?? "";
      if (cursorCol < currentLine.length) {
        setCursorCol(cursorCol + 1);
      } else if (cursorLine < lines.length - 1) {
        const newLineIdx = cursorLine + 1;
        setCursorLine(newLineIdx);
        setCursorCol(0);
        if (newLineIdx >= scrollOffset + rows) {
          setScrollOffset(newLineIdx - rows + 1);
        }
      }
      return;
    }
    if (key.name === "up") {
      if (cursorLine > 0) {
        const newLineIdx = cursorLine - 1;
        const targetLine = lines[newLineIdx] ?? "";
        setCursorLine(newLineIdx);
        setCursorCol(Math.min(cursorCol, targetLine.length));
        if (newLineIdx < scrollOffset) {
          setScrollOffset(newLineIdx);
        }
      }
      return;
    }
    if (key.name === "down") {
      if (cursorLine < lines.length - 1) {
        const newLineIdx = cursorLine + 1;
        const targetLine = lines[newLineIdx] ?? "";
        setCursorLine(newLineIdx);
        setCursorCol(Math.min(cursorCol, targetLine.length));
        if (newLineIdx >= scrollOffset + rows) {
          setScrollOffset(newLineIdx - rows + 1);
        }
      }
      return;
    }
    if (key.name === "escape" || key.name === "tab") {
      return;
    }
    if (key.name.length === 1) {
      const currentLine = lines[cursorLine] ?? "";
      const newLine =
        currentLine.slice(0, cursorCol) +
        key.name +
        currentLine.slice(cursorCol);
      const newLines = [
        ...lines.slice(0, cursorLine),
        newLine,
        ...lines.slice(cursorLine + 1),
      ];
      setValue(joinLines(newLines));
      setCursorCol(cursorCol + key.name.length);
    }
  });

  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;
  const lines = getLines(value);
  const visibleLines = lines.slice(scrollOffset, scrollOffset + rows);

  const paddedLines: string[] = [...visibleLines];
  while (paddedLines.length < rows) {
    paddedLines.push("");
  }

  const isEmpty = value.length === 0;

  return (
    <box flexDirection="column">
      {label && (
        <text>
          <b>{label}</b>
        </text>
      )}
      <box
        flexDirection="column"
        paddingLeft={paddingX}
        paddingRight={paddingX}
      >
        {paddedLines.map((line, rowIdx) => {
          const absoluteLineIdx = rowIdx + scrollOffset;
          const isActiveLine = isFocused && absoluteLineIdx === cursorLine;
          if (isEmpty && rowIdx === 0) {
            return (
              <box key={rowIdx} flexDirection="row">
                <text fg={theme.colors.mutedForeground}>{placeholder}</text>
                {isFocused && <text fg={theme.colors.focusRing}>{cursor}</text>}
              </box>
            );
          }
          if (isActiveLine) {
            const before = line.slice(0, cursorCol);
            const after = line.slice(cursorCol);
            return (
              <box key={rowIdx} flexDirection="row">
                <text fg={theme.colors.foreground}>{before}</text>
                <text fg={theme.colors.focusRing}>{cursor}</text>
                <text fg={theme.colors.foreground}>{after}</text>
              </box>
            );
          }
          return (
            <box key={rowIdx}>
              <text fg={theme.colors.foreground}>{line}</text>
            </box>
          );
        })}
      </box>
    </box>
  );
};
