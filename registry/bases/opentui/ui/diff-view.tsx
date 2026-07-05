/* @jsxImportSource @opentui/react */
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export type DiffMode = "unified" | "split" | "inline";

export interface DiffViewProps {
  oldText: string;
  newText: string;
  filename?: string;
  language?: string;
  mode?: DiffMode;
  context?: number;
  showLineNumbers?: boolean;
}

interface DiffOp {
  type: "equal" | "insert" | "delete";
  line: string;
}

const computeDiff = (oldLines: string[], newLines: string[]): DiffOp[] => {
  const m = oldLines.length;
  const n = newLines.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0)
  );
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      dp[i][j] =
        oldLines[i - 1] === newLines[j - 1]
          ? (dp[i - 1]?.[j - 1] ?? 0) + 1
          : Math.max(dp[i - 1]?.[j] ?? 0, dp[i]?.[j - 1] ?? 0);
    }
  }

  const ops: DiffOp[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      ops.unshift({ line: oldLines[i - 1] ?? "", type: "equal" });
      i -= 1;
      j -= 1;
    } else if (
      j > 0 &&
      (i === 0 || (dp[i]?.[j - 1] ?? 0) >= (dp[i - 1]?.[j] ?? 0))
    ) {
      ops.unshift({ line: newLines[j - 1] ?? "", type: "insert" });
      j -= 1;
    } else {
      ops.unshift({ line: oldLines[i - 1] ?? "", type: "delete" });
      i -= 1;
    }
  }

  return ops;
};

interface Hunk {
  oldStart: number;
  newStart: number;
  ops: DiffOp[];
}

const buildHunks = (ops: DiffOp[], context: number): Hunk[] => {
  let oldLine = 1;
  let newLine = 1;
  const numbered = ops.map((op) => {
    const o = op.type === "insert" ? null : oldLine;
    const n = op.type === "delete" ? null : newLine;
    if (op.type !== "insert") {
      oldLine += 1;
    }
    if (op.type !== "delete") {
      newLine += 1;
    }
    return { ...op, newLine: n, oldLine: o };
  });

  const changed = new Set<number>();
  for (const [idx, op] of numbered.entries()) {
    if (op.type !== "equal") {
      changed.add(idx);
    }
  }

  if (changed.size === 0) {
    return [];
  }

  const included = new Set<number>();
  for (const idx of changed) {
    for (let d = -context; d <= context; d += 1) {
      const t = idx + d;
      if (t >= 0 && t < numbered.length) {
        included.add(t);
      }
    }
  }

  const indices = [...included].toSorted((a, b) => a - b);
  const hunks: Hunk[] = [];
  let start = 0;
  while (start < indices.length) {
    let end = start;
    while (end + 1 < indices.length) {
      const nextIdx = indices[end + 1] ?? 0;
      const curIdx = indices[end] ?? 0;
      if (nextIdx !== curIdx + 1) {
        break;
      }
      end += 1;
    }
    const slice = indices.slice(start, end + 1).map((i) => numbered[i]);
    const firstOld = slice.find((op) => op.oldLine !== null)?.oldLine ?? 1;
    const firstNew = slice.find((op) => op.newLine !== null)?.newLine ?? 1;
    hunks.push({ newStart: firstNew, oldStart: firstOld, ops: slice });
    start = end + 1;
  }

  return hunks;
};

interface ViewProps {
  hunks: Hunk[];
  showLineNumbers: boolean;
  theme: ReturnType<typeof useTheme>;
}

const UnifiedView = ({ hunks, showLineNumbers, theme }: ViewProps) => {
  const rows: ReactNode[] = [];

  for (const hunk of hunks) {
    const oldCount = hunk.ops.filter((op) => op.type !== "insert").length;
    const newCount = hunk.ops.filter((op) => op.type !== "delete").length;
    rows.push(
      <box key={`hunk-${hunk.oldStart}-${hunk.newStart}`}>
        <text fg="cyan">{`@@ -${hunk.oldStart},${oldCount} +${hunk.newStart},${newCount} @@`}</text>
      </box>
    );
    let ol = hunk.oldStart;
    let nl = hunk.newStart;
    for (const op of hunk.ops) {
      const currentOl = op.type === "insert" ? null : ol;
      const currentNl = op.type === "delete" ? null : nl;
      if (op.type !== "insert") {
        ol += 1;
      }
      if (op.type !== "delete") {
        nl += 1;
      }
      const key = `${op.type}-${currentOl ?? "x"}-${currentNl ?? "x"}`;
      if (op.type === "delete") {
        rows.push(
          <box gap={1}>
            {showLineNumbers && (
              <text
                fg={theme.colors.mutedForeground}
              >{`${String(currentOl ?? "").padStart(4)} ${"    "}`}</text>
            )}
            <text fg="red">{`-${op.line}`}</text>
          </box>
        );
      } else if (op.type === "insert") {
        rows.push(
          <box gap={1}>
            {showLineNumbers && (
              <text
                fg={theme.colors.mutedForeground}
              >{`${"    "} ${String(currentNl ?? "").padStart(4)}`}</text>
            )}
            <text fg="green">{`+${op.line}`}</text>
          </box>
        );
      } else {
        rows.push(
          <box gap={1}>
            {showLineNumbers && (
              <text
                fg={theme.colors.mutedForeground}
              >{`${String(currentOl ?? "").padStart(4)} ${String(currentNl ?? "").padStart(4)}`}</text>
            )}
            <text fg="#666">{` ${op.line}`}</text>
          </box>
        );
      }
    }
  }

  return <box flexDirection="column">{rows}</box>;
};

const SplitView = ({ hunks, showLineNumbers, theme }: ViewProps) => {
  const rows: ReactNode[] = [];

  for (const hunk of hunks) {
    const oldCount = hunk.ops.filter((op) => op.type !== "insert").length;
    const newCount = hunk.ops.filter((op) => op.type !== "delete").length;
    rows.push(
      <box key={`hunk-${hunk.oldStart}-${hunk.newStart}`}>
        <text fg="cyan">{`@@ -${hunk.oldStart},${oldCount} +${hunk.newStart},${newCount} @@`}</text>
      </box>
    );
    let ol = hunk.oldStart;
    let nl = hunk.newStart;
    for (const op of hunk.ops) {
      const currentOl = op.type === "insert" ? null : ol;
      const currentNl = op.type === "delete" ? null : nl;
      if (op.type !== "insert") {
        ol += 1;
      }
      if (op.type !== "delete") {
        nl += 1;
      }
      const key = `${op.type}-${currentOl ?? "x"}-${currentNl ?? "x"}`;
      if (op.type === "equal") {
        rows.push(
          <box gap={2}>
            {showLineNumbers && (
              <text fg={theme.colors.mutedForeground}>
                {String(currentOl ?? "").padStart(4)}
              </text>
            )}
            <text fg="#666">{op.line}</text>
            <text>{" │ "}</text>
            {showLineNumbers && (
              <text fg={theme.colors.mutedForeground}>
                {String(currentNl ?? "").padStart(4)}
              </text>
            )}
            <text fg="#666">{op.line}</text>
          </box>
        );
      } else if (op.type === "delete") {
        rows.push(
          <box gap={2}>
            {showLineNumbers && (
              <text fg={theme.colors.mutedForeground}>
                {String(currentOl ?? "").padStart(4)}
              </text>
            )}
            <text fg="red">{`-${op.line}`}</text>
            <text>{" │ "}</text>
            <text> </text>
          </box>
        );
      } else {
        rows.push(
          <box gap={2}>
            <text> </text>
            <text>{" │ "}</text>
            {showLineNumbers && (
              <text fg={theme.colors.mutedForeground}>
                {String(currentNl ?? "").padStart(4)}
              </text>
            )}
            <text fg="green">{`+${op.line}`}</text>
          </box>
        );
      }
    }
  }

  return <box flexDirection="column">{rows}</box>;
};

interface InlineViewProps {
  ops: DiffOp[];
  showLineNumbers: boolean;
  theme: ReturnType<typeof useTheme>;
}

const InlineView = ({ ops, showLineNumbers, theme }: InlineViewProps) => {
  const rows: ReactNode[] = [];
  let oldLine = 1;
  let newLine = 1;

  for (const op of ops) {
    const currentOl = op.type === "insert" ? null : oldLine;
    const currentNl = op.type === "delete" ? null : newLine;
    if (op.type !== "insert") {
      oldLine += 1;
    }
    if (op.type !== "delete") {
      newLine += 1;
    }
    const key = `${op.type}-${currentOl ?? "x"}-${currentNl ?? "x"}`;
    if (op.type === "delete") {
      rows.push(
        <box gap={1}>
          {showLineNumbers && (
            <text
              fg={theme.colors.mutedForeground}
            >{`${String(currentOl ?? "").padStart(4)} ${"    "}`}</text>
          )}
          <text fg="red">{`-${op.line}`}</text>
        </box>
      );
    } else if (op.type === "insert") {
      rows.push(
        <box gap={1}>
          {showLineNumbers && (
            <text
              fg={theme.colors.mutedForeground}
            >{`${"    "} ${String(currentNl ?? "").padStart(4)}`}</text>
          )}
          <text fg="green">{`+${op.line}`}</text>
        </box>
      );
    } else {
      rows.push(
        <box gap={1}>
          {showLineNumbers && (
            <text
              fg={theme.colors.mutedForeground}
            >{`${String(currentOl ?? "").padStart(4)} ${String(currentNl ?? "").padStart(4)}`}</text>
          )}
          <text fg="#666">{` ${op.line}`}</text>
        </box>
      );
    }
  }

  return <box flexDirection="column">{rows}</box>;
};

export const DiffView = ({
  oldText,
  newText,
  filename,
  mode = "unified",
  context = 3,
  showLineNumbers = false,
}: DiffViewProps) => {
  const theme = useTheme();

  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const ops = computeDiff(oldLines, newLines);
  const hunks = buildHunks(ops, context);
  const hasChanges = ops.some((op) => op.type !== "equal");

  if (!hasChanges) {
    return (
      <box flexDirection="column">
        {filename && (
          <text fg={theme.colors.foreground}>
            <b>{filename}</b>
          </text>
        )}
        <text fg={theme.colors.mutedForeground}>No differences</text>
      </box>
    );
  }

  let content: ReactNode;
  if (mode === "split") {
    content = (
      <SplitView
        hunks={hunks}
        showLineNumbers={showLineNumbers}
        theme={theme}
      />
    );
  } else if (mode === "inline") {
    content = (
      <InlineView ops={ops} showLineNumbers={showLineNumbers} theme={theme} />
    );
  } else {
    content = (
      <UnifiedView
        hunks={hunks}
        showLineNumbers={showLineNumbers}
        theme={theme}
      />
    );
  }

  return (
    <box flexDirection="column">
      {filename && (
        <text fg={theme.colors.foreground}>
          <b>{`--- ${filename}`}</b>
        </text>
      )}
      {content}
    </box>
  );
};
