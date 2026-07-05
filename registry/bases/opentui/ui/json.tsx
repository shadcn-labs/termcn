/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface JSONViewProps {
  data: unknown;
  indent?: number;
  collapsed?: boolean;
  label?: string;
}

interface JSONLine {
  path: string;
  depth: number;
  key?: string;
  value?: unknown;
  type: "open" | "close" | "primitive";
  openChar?: string;
  closeChar?: string;
  isLast: boolean;
  collapsible: boolean;
}

const buildLines = (
  data: unknown,
  depth: number,
  key: string | undefined,
  isLast: boolean,
  pathPrefix: string
): JSONLine[] => {
  const path = key === undefined ? pathPrefix : `${pathPrefix}.${key}`;

  if (Array.isArray(data)) {
    const lines: JSONLine[] = [
      {
        closeChar: "]",
        collapsible: true,
        depth,
        isLast,
        key,
        openChar: "[",
        path,
        type: "open",
      },
    ];
    for (const [idx, item] of data.entries()) {
      const childLines = buildLines(
        item,
        depth + 1,
        undefined,
        idx === data.length - 1,
        path
      );
      lines.push(...childLines);
    }
    lines.push({
      closeChar: "]",
      collapsible: false,
      depth,
      isLast,
      path: `${path}_close`,
      type: "close",
    });
    return lines;
  }

  if (data !== null && typeof data === "object") {
    const entries = Object.entries(data as Record<string, unknown>);
    const lines: JSONLine[] = [
      {
        closeChar: "}",
        collapsible: true,
        depth,
        isLast,
        key,
        openChar: "{",
        path,
        type: "open",
      },
    ];
    for (const [idx, [k, v]] of entries.entries()) {
      const childLines = buildLines(
        v,
        depth + 1,
        k,
        idx === entries.length - 1,
        path
      );
      lines.push(...childLines);
    }
    lines.push({
      closeChar: "}",
      collapsible: false,
      depth,
      isLast,
      path: `${path}_close`,
      type: "close",
    });
    return lines;
  }

  return [
    {
      collapsible: false,
      depth,
      isLast,
      key,
      path,
      type: "primitive",
      value: data,
    },
  ];
};

export const JSONView = ({
  data,
  indent = 2,
  collapsed = false,
  label,
}: JSONViewProps) => {
  const theme = useTheme();
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const [cursor, setCursor] = useState(0);

  const lines = buildLines(data, 0, undefined, true, "root");

  const visibleLines: JSONLine[] = [];
  const collapsedOpenPaths = new Set<string>();

  for (const line of lines) {
    const isHidden = [...collapsedOpenPaths].some(
      (cp) =>
        line.path.startsWith(`${cp}.`) ||
        (line.path.startsWith(`${cp}_close`) && line.path !== `${cp}_close`)
    );
    if (line.type === "close") {
      const openPath = line.path.replace("_close", "");
      if (collapsedOpenPaths.has(openPath)) {
        continue;
      }
    }
    if (!isHidden) {
      visibleLines.push(line);
    }
    if (
      line.type === "open" &&
      (collapsedPaths.has(line.path) ||
        (collapsed && collapsedPaths.size === 0 && line.depth === 0))
    ) {
      collapsedOpenPaths.add(line.path);
    }
  }

  useKeyboard((key) => {
    if (key.name === "up") {
      setCursor((c) => Math.max(0, c - 1));
    } else if (key.name === "down") {
      setCursor((c) => Math.min(visibleLines.length - 1, c + 1));
    } else if (key.name === "space") {
      const line = visibleLines[cursor];
      if (line && line.collapsible) {
        setCollapsedPaths((prev) => {
          const next = new Set(prev);
          if (next.has(line.path)) {
            next.delete(line.path);
          } else {
            next.add(line.path);
          }
          return next;
        });
      }
    }
  });

  const renderValue = (value: unknown): ReactNode => {
    if (value === null) {
      return <text fg={theme.colors.mutedForeground}>null</text>;
    }
    if (typeof value === "string") {
      return <text fg={theme.colors.success}>{`"${value}"`}</text>;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return <text fg={theme.colors.warning}>{String(value)}</text>;
    }
    return <text fg={theme.colors.foreground}>{String(value)}</text>;
  };

  return (
    <box flexDirection="column">
      {label && (
        <text fg={theme.colors.primary}>
          <b>{label}</b>
        </text>
      )}
      {visibleLines.map((line, idx) => {
        const isCursor = idx === cursor;
        const spaces = " ".repeat(line.depth * indent);
        if (line.type === "open") {
          const isCollapsed =
            collapsedPaths.has(line.path) ||
            (collapsed && collapsedPaths.size === 0 && line.depth === 0);
          return (
            <box key={line.path + idx}>
              <text bg={isCursor ? theme.colors.selection : undefined}>
                {spaces}
                {line.key !== undefined ? (
                  <>
                    <text fg={theme.colors.primary}>{`"${line.key}"`}</text>
                    <text fg={theme.colors.foreground}>{": "}</text>
                  </>
                ) : null}
                <text fg={theme.colors.foreground}>{line.openChar}</text>
                {isCollapsed ? (
                  <>
                    <text fg={theme.colors.mutedForeground}>{" ... "}</text>
                    <text fg={theme.colors.foreground}>{line.closeChar}</text>
                    {!line.isLast ? (
                      <text fg={theme.colors.foreground}>,</text>
                    ) : null}
                  </>
                ) : null}
              </text>
            </box>
          );
        }
        if (line.type === "close") {
          return (
            <box key={line.path + idx}>
              <text bg={isCursor ? theme.colors.selection : undefined}>
                {spaces}
                <text fg={theme.colors.foreground}>{line.closeChar}</text>
                {!line.isLast ? (
                  <text fg={theme.colors.foreground}>,</text>
                ) : null}
              </text>
            </box>
          );
        }
        return (
          <box key={line.path + idx}>
            <text bg={isCursor ? theme.colors.selection : undefined}>
              {spaces}
              {line.key !== undefined ? (
                <>
                  <text fg={theme.colors.primary}>{`"${line.key}"`}</text>
                  <text fg={theme.colors.foreground}>{": "}</text>
                </>
              ) : null}
              {renderValue(line.value)}
              {!line.isLast ? (
                <text fg={theme.colors.foreground}>,</text>
              ) : null}
            </text>
          </box>
        );
      })}
    </box>
  );
};
