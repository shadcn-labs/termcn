import { Box, Text } from "ink";
import React, { useEffect, useMemo, useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";
import {
  padToTerminalWidth,
  removeGraphemeBefore,
  terminalWidth,
  truncateToTerminalWidth,
} from "@/registry/bases/ink/lib/terminal-text";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

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
> extends InteractionProps {
  data: T[];
  columns: DataGridColumn<T>[];
  pageSize?: number;
  onRowSelect?: (row: T) => void;
  onCellEdit?: (row: T, key: string, value: string) => void;
  borderColor?: string;
  borderStyle?: BorderStyle;
  showRowNumbers?: boolean;
  filterPlaceholder?: string;
  "aria-label"?: string;
  getRowKey?: (row: T, index: number) => React.Key;
}

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
    const left = Math.floor(diff / 2);
    return " ".repeat(left) + s + " ".repeat(diff - left);
  }
  return padToTerminalWidth(s, width);
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
  filterPlaceholder = "Type to filter",
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel = "Data grid",
  getRowKey,
}: DataGridProps<T>) => {
  const unicode = useUnicode();
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
        const headerLen = terminalWidth(col.header);
        const dataLen = Math.max(
          0,
          ...data.map((row) => terminalWidth(String(row[col.key] ?? "")))
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

  const { isFocused } = useInteraction(
    (input, key) => {
      if (filterMode) {
        if (key.escape) {
          setFilterMode(false);
        } else if (key.return) {
          setFilterMode(false);
        } else if (key.backspace || key.delete) {
          setFilter(
            (f) => removeGraphemeBefore(f, Number.POSITIVE_INFINITY).value
          );
        } else if (input && !key.ctrl && !key.meta) {
          setFilter((f) => f + input);
        }
        return;
      }

      if (key.upArrow) {
        setSelectedRow((r) => Math.max(0, r - 1));
      } else if (key.downArrow) {
        setSelectedRow((r) => Math.min(pageData.length - 1, r + 1));
      } else if (key.home) {
        setSelectedRow(0);
      } else if (key.end) {
        setSelectedRow(Math.max(0, pageData.length - 1));
      } else if (key.return || input === " ") {
        if (pageData[selectedRow]) {
          onRowSelect?.(pageData[selectedRow]);
        }
      } else if (key.pageDown || input === "n") {
        setPage((p) => Math.min(totalPages - 1, p + 1));
        setSelectedRow(0);
      } else if (key.pageUp || input === "p") {
        setPage((p) => Math.max(0, p - 1));
        setSelectedRow(0);
      } else if (input === "/") {
        setFilterMode(true);
      } else if (input === "s" && sortKey === null) {
        setSortKey(columns[0]?.key ?? null);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  useEffect(() => {
    setSelectedRow((row) => Math.min(row, Math.max(0, pageData.length - 1)));
  }, [pageData.length]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages - 1));
  }, [totalPages]);

  const colSep = unicode ? " │ " : " | ";

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
      <Box flexDirection="row">
        {rowNumStr && <Text dimColor>{rowNumStr}</Text>}
        <Text
          backgroundColor={isSelected ? theme.colors.primary : undefined}
          color={isSelected ? theme.colors.background : undefined}
        >
          {cells.join(colSep)}
        </Text>
      </Box>
    );
  };

  const headerCells = columns.map((col, ci) => {
    const isSorted = sortKey === col.key;
    const sortArrow =
      sortDir === "asc" ? (unicode ? " ↑" : " up") : unicode ? " ↓" : " down";
    const indicator = isSorted ? sortArrow : "";
    return pad(col.header + indicator, colWidths[ci], col.align);
  });

  const rowNumHeader = showRowNumbers ? "    " : "";

  return (
    <Box
      flexDirection="column"
      aria-role="table"
      aria-state={{ disabled: disabled || undefined }}
    >
      <Text
        aria-label={`${ariaLabel}. Page ${page + 1} of ${totalPages}. ${sorted.length} rows.`}
      >
        {""}
      </Text>
      {isFocused && pageData[selectedRow] && (
        <Text
          aria-label={`Selected row ${page * pageSize + selectedRow + 1}: ${columns
            .map(
              (column) =>
                `${column.header}: ${String(pageData[selectedRow]?.[column.key] ?? "")}`
            )
            .join(", ")}`}
        >
          {""}
        </Text>
      )}
      {(filterMode || filter) && (
        <Box flexDirection="row" marginBottom={1}>
          <Text color={theme.colors.primary}>{"Filter: "}</Text>
          <Text>{filter}</Text>
          {filterMode && (
            <Text aria-hidden color={theme.colors.focusRing}>
              {unicode ? "█" : "|"}
            </Text>
          )}
          {!filter && <Text aria-label={filterPlaceholder}>{""}</Text>}
        </Box>
      )}

      <Box
        aria-hidden
        borderStyle={resolveBorderStyle(borderStyle, unicode)}
        borderColor={resolvedBorderColor}
        flexDirection="column"
      >
        <Box flexDirection="row" paddingX={1}>
          {rowNumHeader && <Text dimColor>{rowNumHeader}</Text>}
          <Text bold color={theme.colors.primary}>
            {headerCells.join(colSep)}
          </Text>
        </Box>
        <Text color={resolvedBorderColor}>
          {(unicode ? "─" : "-").repeat(headerCells.join(colSep).length + 2)}
        </Text>

        {pageData.length > 0 ? (
          pageData.map((row, i) => (
            <Box key={getRowKey?.(row, i) ?? i} paddingX={1}>
              {renderRow(row, i, i === selectedRow)}
            </Box>
          ))
        ) : (
          <Box paddingX={1}>
            <Text dimColor>No data</Text>
          </Box>
        )}
      </Box>

      {pageData.map((row, rowIdx) => (
        <Text
          key={`accessible-${String(getRowKey?.(row, rowIdx) ?? rowIdx)}`}
          aria-label={`Row ${page * pageSize + rowIdx + 1}: ${columns
            .map(
              (column) => `${column.header}: ${String(row[column.key] ?? "")}`
            )
            .join(", ")}`}
        >
          {""}
        </Text>
      ))}

      <Box flexDirection="row" gap={2} marginTop={1}>
        <Text dimColor>
          {`Page ${page + 1}/${totalPages} (${sorted.length} rows)`}
        </Text>
        <Text aria-hidden dimColor>
          {unicode
            ? "↑↓ navigate PgUp/PgDn page / filter Enter select"
            : "up/down navigate PgUp/PgDn page / filter Enter select"}
        </Text>
      </Box>
    </Box>
  );
};
