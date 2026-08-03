/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import { useInputPaste } from "@/registry/bases/opentui/lib/input-paste";
import {
  decodePaste,
  getKeyText,
} from "@/registry/bases/opentui/lib/input-utils";
import type { BorderStyle } from "@/registry/bases/opentui/ui/types";

export interface TextAreaProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  autoFocus?: boolean;
  focused?: boolean;
  isDisabled?: boolean;
  id?: string;
  borderStyle?: BorderStyle;
  paddingX?: number;
  cursor?: string;
}

const getLines = (v: string): string[] => v.split("\n");

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
  focused,
  isDisabled = false,
  id,
  borderStyle = "rounded",
  paddingX = 1,
  cursor = "█",
}: TextAreaProps) => {
  const [internalValue, setInternalValue] = useState("");
  const initialCursor = getEndPosition(controlledValue ?? "");
  const [cursorLine, setCursorLine] = useState(initialCursor.line);
  const [cursorCol, setCursorCol] = useState(initialCursor.column);
  const [scrollOffset, setScrollOffset] = useState(0);
  const theme = useTheme();
  const isFocused = !isDisabled && (focused ?? autoFocus);
  const visibleRowCount = Math.max(1, rows);

  const value = controlledValue ?? internalValue;

  useEffect(() => {
    const lines = getLines(value);
    const nextLine = Math.min(cursorLine, Math.max(0, lines.length - 1));
    const nextColumn = Math.min(cursorCol, lines[nextLine]?.length ?? 0);
    if (nextLine !== cursorLine) {
      setCursorLine(nextLine);
    }
    if (nextColumn !== cursorCol) {
      setCursorCol(nextColumn);
    }
  }, [cursorCol, cursorLine, value]);

  const setValue = (newVal: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newVal);
    }
    onChange?.(newVal);
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
    const before = currentLine.slice(0, cursorCol);
    const after = currentLine.slice(cursorCol);
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
      nextColumn = cursorCol + inserted.length;
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
    setCursorCol(nextColumn);
    keepCursorVisible(nextLine);
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
      insertText("\n");
      return;
    }
    if (key.name === "backspace") {
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
    if (key.name === "delete") {
      const currentLine = lines[cursorLine] ?? "";
      if (cursorCol < currentLine.length) {
        const newLine =
          currentLine.slice(0, cursorCol) + currentLine.slice(cursorCol + 1);
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
        if (newLineIdx >= scrollOffset + visibleRowCount) {
          setScrollOffset(newLineIdx - visibleRowCount + 1);
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
        if (newLineIdx >= scrollOffset + visibleRowCount) {
          setScrollOffset(newLineIdx - visibleRowCount + 1);
        }
      }
      return;
    }
    if (key.name === "escape" || key.name === "tab") {
      return;
    }
    insertText(getKeyText(key));
  });

  useInputPaste((event) => {
    if (!isFocused) {
      return;
    }
    const input = decodePaste(event.bytes);
    if (!input) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    insertText(input);
  });

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
    <box id={id} flexDirection="column">
      {label && (
        <text>
          <b>{label}</b>
        </text>
      )}
      <box
        flexDirection="column"
        borderStyle={borderStyle}
        borderColor={borderColor}
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
