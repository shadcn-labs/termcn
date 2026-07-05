/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import type { Key } from "react";
import { useMemo, useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface Column<T = Record<string, unknown>> {
  key: keyof T & string;
  header: string;
  width?: number;
  align?: "left" | "right" | "center";
}

export interface TableProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  data: T[];
  columns: Column<T>[];
  sortable?: boolean;
  selectable?: boolean;
  onSelect?: (row: T) => void;
  maxRows?: number;
  borderColor?: string;
}

const BORDER = {
  bottom: { cross: "┴", left: "╰", line: "─", right: "╯" },
  data: { cross: "│", left: "│", line: " ", right: "│" },
  heading: { cross: "│", left: "│", line: " ", right: "│" },
  separator: { cross: "┼", left: "├", line: "─", right: "┤" },
  top: { cross: "┬", left: "╭", line: "─", right: "╮" },
} as const;

const pad = (
  str: string,
  width: number,
  align: "left" | "right" | "center" = "left"
): string => {
  const s = String(str);
  if (s.length >= width) {
    return s.slice(0, width);
  }
  const diff = width - s.length;
  if (align === "right") {
    return " ".repeat(diff) + s;
  }
  if (align === "center") {
    const l = Math.floor(diff / 2);
    return " ".repeat(l) + s + " ".repeat(diff - l);
  }
  return s + " ".repeat(diff);
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
  <box flexDirection="row">
    <text fg={color}>{skeleton.left}</text>
    {intersperse(
      widths.map((w, i) => (
        <text key={i} fg={color}>
          {skeleton.line.repeat(w + 2)}
        </text>
      )),
      (i) => (
        <text key={`sep-${i}`} fg={color}>
          {skeleton.cross}
        </text>
      )
    )}
    <text fg={color}>{skeleton.right}</text>
  </box>
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
  key?: Key | null;
  widths: number[];
  cells: {
    text: string;
    align: "left" | "right" | "center";
  }[];
  skeleton: SkeletonChars;
  borderColor: string;
  textColor: string;
  bold?: boolean;
  inverse?: boolean;
}) => (
  <box flexDirection="row">
    <text fg={borderColor}>{skeleton.left}</text>
    {intersperse(
      cells.map((cell, i) => {
        const content = ` ${pad(cell.text, widths[i] ?? 0, cell.align)} `;
        return (
          <text
            key={i}
            fg={inverse ? undefined : textColor}
            bg={inverse ? textColor : undefined}
          >
            {bold ? <b>{content}</b> : content}
          </text>
        );
      }),
      (i) => (
        <text key={`sep-${i}`} fg={borderColor}>
          {skeleton.cross}
        </text>
      )
    )}
    <text fg={borderColor}>{skeleton.right}</text>
  </box>
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
}: TableProps<T>) => {
  const theme = useTheme();
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

  useKeyboard((key) => {
    if (key.name === "up") {
      setActiveRow((r) => Math.max(0, r - 1));
    } else if (key.name === "down") {
      setActiveRow((r) => Math.min(visible.length - 1, r + 1));
    } else if (key.name === "return" && selectable) {
      onSelect?.(visible[activeRow] as T);
    } else if (sortable && key.name === "left") {
      setSortColIdx((i) => Math.max(0, i - 1));
    } else if (sortable && key.name === "right") {
      setSortColIdx((i) => Math.min(columns.length - 1, i + 1));
    } else if (sortable && key.name === "s") {
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
  });

  const colWidths = columns.map((col) => {
    let dataMax = 0;
    for (const row of data) {
      dataMax = Math.max(dataMax, String(row[col.key] ?? "").length);
    }
    return col.width ?? Math.max(col.header.length, dataMax);
  });

  const headerCells = columns.map((col) => ({
    align: col.align ?? ("left" as const),
    text: col.header,
  }));

  return (
    <box flexDirection="column">
      <SkeletonRow
        widths={colWidths}
        skeleton={BORDER.top}
        color={resolvedBorderColor}
      />
      <CellRow
        widths={colWidths}
        cells={headerCells}
        skeleton={BORDER.heading}
        borderColor={resolvedBorderColor}
        textColor={theme.colors.primary}
        bold={true}
      />
      <SkeletonRow
        widths={colWidths}
        skeleton={BORDER.separator}
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
            key={rowIdx}
            widths={colWidths}
            cells={rowCells}
            skeleton={BORDER.data}
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
      {data.length > maxRows
        ? (() => {
            const innerWidth =
              colWidths.reduce((a, b) => a + b, 0) + colWidths.length * 3 - 3;
            const msg = `… ${data.length - maxRows} more rows`;
            return (
              <box flexDirection="row">
                <text fg={resolvedBorderColor}>│</text>
                <text
                  fg={theme.colors.mutedForeground}
                >{` ${pad(msg, innerWidth)} `}</text>
                <text fg={resolvedBorderColor}>│</text>
              </box>
            );
          })()
        : null}
      <SkeletonRow
        widths={colWidths}
        skeleton={BORDER.bottom}
        color={resolvedBorderColor}
      />
    </box>
  );
};
