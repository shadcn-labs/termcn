/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState, useMemo } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import type { BorderStyle } from "@/components/ui/opentui-theme-provider";

export interface DataGridColumn<T = Record<string, unknown>> {
  key: keyof T & string;
  header: string;
  width?: number;
  align?: "left" | "right" | "center";
  render?: (value: unknown, row: T) => string;
  filterable?: boolean;
  sortable?: boolean;
}

export interface DataGridProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  data: T[];
  columns: DataGridColumn<T>[];
  pageSize?: number;
  onRowSelect?: (row: T) => void;
  onCellEdit?: (row: T, key: string, value: string) => void;
  borderColor?: string;
  borderStyle?: BorderStyle;
  showRowNumbers?: boolean;
  filterPlaceholder?: string;
}

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
    const left = Math.floor(diff / 2);
    return " ".repeat(left) + `${s} `.repeat(diff - left);
  }
  return `${s} `.repeat(diff);
};

export const DataGrid = <
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  data,
  columns,
  pageSize = 10,
  onRowSelect,
  borderColor,
  borderStyle = "single",
  showRowNumbers = false,
}: DataGridProps<T>) => {
  const theme = useTheme();
  const [selectedRow, setSelectedRow] = useState(0);
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, _setSortDir] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState("");
  const [filterMode, setFilterMode] = useState(false);

  const resolvedBorderColor = borderColor ?? theme.colors.border;

  const colWidths = useMemo(
    () =>
      columns.map((col) => {
        if (col.width) {
          return col.width;
        }
        const headerLen = col.header.length;
        const dataLen = Math.max(
          ...data.map((row) => String(row[col.key] ?? "").length)
        );
        return Math.max(headerLen, dataLen, 6);
      }),
    [columns, data]
  );

  const filtered = useMemo(() => {
    if (!filter) {
      return data;
    }
    const q = filter.toLowerCase();
    return data.filter((row) =>
      columns.some((col) =>
        String(row[col.key] ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [data, filter, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) {
      return filtered;
    }
    return [...filtered].toSorted((a, b) => {
      const av = String(a[sortKey] ?? "");
      const bv = String(b[sortKey] ?? "");
      const cmp = av.localeCompare(bv);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = sorted.slice(page * pageSize, (page + 1) * pageSize);

  useKeyboard((key) => {
    if (filterMode) {
      if (key.name === "escape") {
        setFilterMode(false);
      } else if (key.name === "return") {
        setFilterMode(false);
      } else if (key.name === "backspace" || key.name === "delete") {
        setFilter((f) => f.slice(0, -1));
      } else if (key.name.length === 1 && !key.ctrl && !key.meta) {
        setFilter((f) => f + key.name);
      }
      return;
    }
    if (key.name === "up") {
      setSelectedRow((r) => Math.max(0, r - 1));
    } else if (key.name === "down") {
      setSelectedRow((r) => Math.min(pageData.length - 1, r + 1));
    } else if (key.name === "return" || key.name === "space") {
      if (pageData[selectedRow]) {
        onRowSelect?.(pageData[selectedRow]);
      }
    } else if (key.name === "pagedown" || key.name === "n") {
      setPage((p) => Math.min(totalPages - 1, p + 1));
      setSelectedRow(0);
    } else if (key.name === "pageup" || key.name === "p") {
      setPage((p) => Math.max(0, p - 1));
      setSelectedRow(0);
    } else if (key.name === "/") {
      setFilterMode(true);
    } else if (key.name === "s" && sortKey === null) {
      setSortKey(columns[0]?.key ?? null);
    }
  });

  const colSep = " │ ";

  const renderRow = (row: T, rowIdx: number, isSelected: boolean) => {
    const cells = columns.map((col, ci) => {
      const raw = col.render
        ? col.render(row[col.key], row)
        : String(row[col.key] ?? "");
      return pad(raw, colWidths[ci], col.align);
    });

    const rowNumStr = showRowNumbers
      ? `${String(page * pageSize + rowIdx + 1).padStart(3)} `
      : "";

    return (
      <box key={rowIdx} flexDirection="row">
        {rowNumStr && <text fg="#666">{rowNumStr}</text>}
        <text
          bg={isSelected ? theme.colors.primary : undefined}
          fg={isSelected ? theme.colors.background : undefined}
        >
          {cells.join(colSep)}
        </text>
      </box>
    );
  };

  const headerCells = columns.map((col, ci) => {
    const isSorted = sortKey === col.key;
    const sortArrow = sortDir === "asc" ? " ↑" : " ↓";
    const indicator = isSorted ? sortArrow : "";
    return pad(col.header + indicator, colWidths[ci], col.align);
  });

  const rowNumHeader = showRowNumbers ? "    " : "";

  return (
    <box flexDirection="column">
      {(filterMode || filter) && (
        <box flexDirection="row" marginBottom={1}>
          <text fg={theme.colors.primary}>{"Filter: "}</text>
          <text>{filter}</text>
          {filterMode && <text fg={theme.colors.focusRing}>█</text>}
        </box>
      )}

      <box borderColor={resolvedBorderColor} flexDirection="column">
        <box flexDirection="row" paddingLeft={1} paddingRight={1}>
          {rowNumHeader && <text fg="#666">{rowNumHeader}</text>}
          <text fg={theme.colors.primary}>
            <b>{headerCells.join(colSep)}</b>
          </text>
        </box>
        <text fg={resolvedBorderColor}>
          {"─".repeat(headerCells.join(colSep).length + 2)}
        </text>

        {pageData.length > 0 ? (
          pageData.map((row, i) => (
            <box key={i} paddingLeft={1} paddingRight={1}>
              {renderRow(row, i, i === selectedRow)}
            </box>
          ))
        ) : (
          <box paddingLeft={1} paddingRight={1}>
            <text fg="#666">No data</text>
          </box>
        )}
      </box>

      <box flexDirection="row" gap={2} marginTop={1}>
        <text fg="#666">{`Page ${page + 1}/${totalPages} (${sorted.length} rows)`}</text>
        <text fg="#666">↑↓ navigate n/p page / filter Enter select</text>
      </box>
    </box>
  );
};
