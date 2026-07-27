import { Box, Text } from "ink";
import { useEffect, useMemo, useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import {
  padToTerminalWidth,
  terminalWidth,
  truncateToTerminalWidth,
} from "@/registry/bases/ink/lib/terminal-text";

export interface Column<T = Record<string, unknown>> {
  key: keyof T & string;
  header: string;
  width?: number;
  align?: "left" | "right" | "center";
}

export interface TableProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends InteractionProps {
  data: T[];
  columns: Column<T>[];
  sortable?: boolean;
  selectable?: boolean;
  onSelect?: (row: T) => void;
  maxRows?: number;
  borderColor?: string;
  "aria-label"?: string;
  getRowKey?: (row: T, index: number) => React.Key;
}

const BORDER = {
  bottom: { cross: "┴", left: "╰", line: "─", right: "╯" },
  data: { cross: "│", left: "│", line: " ", right: "│" },
  heading: { cross: "│", left: "│", line: " ", right: "│" },
  separator: { cross: "┼", left: "├", line: "─", right: "┤" },
  top: { cross: "┬", left: "╭", line: "─", right: "╮" },
} as const;

const ASCII_BORDER = {
  bottom: { cross: "+", left: "+", line: "-", right: "+" },
  data: { cross: "|", left: "|", line: " ", right: "|" },
  heading: { cross: "|", left: "|", line: " ", right: "|" },
  separator: { cross: "+", left: "+", line: "-", right: "+" },
  top: { cross: "+", left: "+", line: "-", right: "+" },
} as const;

const pad = (
  str: string,
  width: number,
  align: "left" | "right" | "center" = "left"
): string => {
  const s = truncateToTerminalWidth(String(str), width);
  const diff = Math.max(0, width - terminalWidth(s));
  if (align === "right") {
    return " ".repeat(diff) + s;
  }
  if (align === "center") {
    const l = Math.floor(diff / 2);
    return " ".repeat(l) + s + " ".repeat(diff - l);
  }
  return padToTerminalWidth(s, width);
};

const intersperse = <T,>(items: T[], separator: (index: number) => T): T[] => {
  const result: T[] = [];
  for (let i = 0; i < items.length; i += 1) {
    if (i > 0) {
      result.push(separator(i));
    }
    const item = items[i];
    if (item !== undefined) {
      result.push(item);
    }
  }
  return result;
};

interface SkeletonChars {
  left: string;
  right: string;
  cross: string;
  line: string;
}

const SkeletonRow = ({
  widths,
  skeleton,
  color,
}: {
  widths: number[];
  skeleton: SkeletonChars;
  color: string;
}) => (
  <Box flexDirection="row">
    <Text color={color}>{skeleton.left}</Text>
    {intersperse(
      widths.map((w, i) => (
        <Text key={i} color={color}>
          {skeleton.line.repeat(w + 2)}
        </Text>
      )),
      (i) => (
        <Text key={`sep-${i}`} color={color}>
          {skeleton.cross}
        </Text>
      )
    )}
    <Text color={color}>{skeleton.right}</Text>
  </Box>
);

const CellRow = ({
  widths,
  cells,
  skeleton,
  borderColor,
  textColor,
  bold,
  inverse,
}: {
  widths: number[];
  cells: { text: string; align: "left" | "right" | "center" }[];
  skeleton: SkeletonChars;
  borderColor: string;
  textColor: string;
  bold?: boolean;
  inverse?: boolean;
}) => (
  <Box flexDirection="row">
    <Text color={borderColor}>{skeleton.left}</Text>
    {intersperse(
      cells.map((cell, i) => (
        <Text key={i} color={textColor} bold={bold} inverse={inverse}>
          {` ${pad(cell.text, widths[i] ?? 0, cell.align)} `}
        </Text>
      )),
      (i) => (
        <Text key={`sep-${i}`} color={borderColor}>
          {skeleton.cross}
        </Text>
      )
    )}
    <Text color={borderColor}>{skeleton.right}</Text>
  </Box>
);

export const Table = <
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  data,
  columns,
  sortable = false,
  selectable = false,
  onSelect,
  maxRows = 20,
  borderColor,
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel = "Data table",
  getRowKey,
}: TableProps<T>) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const border = unicode ? BORDER : ASCII_BORDER;
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeRow, setActiveRow] = useState(0);
  const [sortColIdx, setSortColIdx] = useState(0);

  const resolvedBorderColor = borderColor ?? theme.colors.border;

  const sorted = useMemo(() => {
    if (!sortKey) {
      return data;
    }
    return [...data].toSorted((a, b) => {
      const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const visible = sorted.slice(0, maxRows);

  const { isFocused } = useInteraction(
    (input, key) => {
      if (visible.length === 0) {
        return;
      }
      if (key.upArrow) {
        setActiveRow((r) => Math.max(0, r - 1));
      } else if (key.downArrow) {
        setActiveRow((r) => Math.min(visible.length - 1, r + 1));
      } else if (key.home) {
        setActiveRow(0);
      } else if (key.end) {
        setActiveRow(visible.length - 1);
      } else if (key.return && selectable) {
        onSelect?.(visible[activeRow] as T);
      } else if (sortable && key.leftArrow) {
        setSortColIdx((i) => Math.max(0, i - 1));
      } else if (sortable && key.rightArrow) {
        setSortColIdx((i) => Math.min(columns.length - 1, i + 1));
      } else if (sortable && input === "s") {
        const col = columns[sortColIdx];
        if (!col) {
          return;
        }
        if (sortKey === col.key) {
          setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
          setSortKey(col.key);
          setSortDir("asc");
        }
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  useEffect(() => {
    setActiveRow((row) => Math.min(row, Math.max(0, visible.length - 1)));
  }, [visible.length]);

  const colWidths = columns.map((col) => {
    let dataMax = 0;
    for (const row of data) {
      dataMax = Math.max(dataMax, terminalWidth(String(row[col.key] ?? "")));
    }
    return col.width ?? Math.max(terminalWidth(col.header), dataMax);
  });

  const headerCells = columns.map((col) => ({
    align: col.align ?? ("left" as const),
    text: col.header,
  }));

  return (
    <Box
      flexDirection="column"
      aria-role="table"
      aria-state={{ disabled: disabled || undefined }}
    >
      <Text aria-label={`${ariaLabel}. ${visible.length} visible rows.`}>
        {""}
      </Text>
      {isFocused && selectable && visible[activeRow] && (
        <Text
          aria-label={`Selected row ${activeRow + 1}: ${columns
            .map(
              (column) =>
                `${column.header}: ${String(visible[activeRow]?.[column.key] ?? "")}`
            )
            .join(", ")}`}
        >
          {""}
        </Text>
      )}
      <Box aria-hidden>
        <SkeletonRow
          widths={colWidths}
          skeleton={border.top}
          color={resolvedBorderColor}
        />
        <CellRow
          widths={colWidths}
          cells={headerCells}
          skeleton={border.heading}
          borderColor={resolvedBorderColor}
          textColor={theme.colors.primary}
          bold
        />
        <SkeletonRow
          widths={colWidths}
          skeleton={border.separator}
          color={resolvedBorderColor}
        />
        {visible.map((row, rowIdx) => {
          const isActive = rowIdx === activeRow && selectable;
          const rowCells = columns.map((col) => ({
            align: col.align ?? ("left" as const),
            text: String(row[col.key] ?? ""),
          }));
          return (
            <CellRow
              key={getRowKey?.(row, rowIdx) ?? rowIdx}
              widths={colWidths}
              cells={rowCells}
              skeleton={border.data}
              borderColor={resolvedBorderColor}
              textColor={
                isActive
                  ? theme.colors.selectionForeground
                  : theme.colors.foreground
              }
              inverse={isActive}
            />
          );
        })}
        {data.length > maxRows &&
          (() => {
            const innerWidth =
              colWidths.reduce((a, b) => a + b, 0) + colWidths.length * 3 - 3;
            const msg = `${unicode ? "…" : "..."} ${data.length - maxRows} more rows`;
            return (
              <Box flexDirection="row">
                <Text color={resolvedBorderColor}>{border.data.left}</Text>
                <Text color={theme.colors.mutedForeground} dimColor>
                  {` ${pad(msg, innerWidth)} `}
                </Text>
                <Text color={resolvedBorderColor}>{border.data.right}</Text>
              </Box>
            );
          })()}
        <SkeletonRow
          widths={colWidths}
          skeleton={border.bottom}
          color={resolvedBorderColor}
        />
      </Box>
      {visible.map((row, rowIdx) => (
        <Text
          key={`accessible-${String(getRowKey?.(row, rowIdx) ?? rowIdx)}`}
          aria-label={`Row ${rowIdx + 1}: ${columns
            .map(
              (column) => `${column.header}: ${String(row[column.key] ?? "")}`
            )
            .join(", ")}`}
        >
          {""}
        </Text>
      ))}
    </Box>
  );
};
