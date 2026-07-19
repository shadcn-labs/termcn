import { useIsScreenReaderEnabled, Box, Text } from "ink";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";

export type DiffMode = "unified" | "split" | "inline";

export interface DiffViewProps {
  oldText: string;
  newText: string;
  filename?: string;
  language?: string;
  mode?: DiffMode;
  context?: number;
  showLineNumbers?: boolean;
  accessibleSummary?: string;
  "aria-label"?: string;
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
  separator: string;
  showLineNumbers: boolean;
  theme: ReturnType<typeof useTheme>;
}

const UnifiedView = ({ hunks, showLineNumbers, theme }: ViewProps) => {
  const rows: React.ReactNode[] = [];

  for (const hunk of hunks) {
    const oldCount = hunk.ops.filter((op) => op.type !== "insert").length;
    const newCount = hunk.ops.filter((op) => op.type !== "delete").length;
    rows.push(
      <Box key={`hunk-${hunk.oldStart}-${hunk.newStart}`}>
        <Text color="cyan" dimColor>
          @@ -{hunk.oldStart},{oldCount} +{hunk.newStart},{newCount} @@
        </Text>
      </Box>
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
          <Box key={key} gap={1}>
            {showLineNumbers && (
              <Text color={theme.colors.mutedForeground} dimColor>
                {String(currentOl ?? "").padStart(4)} {" ".repeat(4)}
              </Text>
            )}
            <Text color="red">-{op.line}</Text>
          </Box>
        );
      } else if (op.type === "insert") {
        rows.push(
          <Box key={key} gap={1}>
            {showLineNumbers && (
              <Text color={theme.colors.mutedForeground} dimColor>
                {" ".repeat(4)} {String(currentNl ?? "").padStart(4)}
              </Text>
            )}
            <Text color="green">+{op.line}</Text>
          </Box>
        );
      } else {
        rows.push(
          <Box key={key} gap={1}>
            {showLineNumbers && (
              <Text color={theme.colors.mutedForeground} dimColor>
                {String(currentOl ?? "").padStart(4)}{" "}
                {String(currentNl ?? "").padStart(4)}
              </Text>
            )}
            <Text dimColor> {op.line}</Text>
          </Box>
        );
      }
    }
  }

  return <Box flexDirection="column">{rows}</Box>;
};

const SplitView = ({ hunks, separator, showLineNumbers, theme }: ViewProps) => {
  const rows: React.ReactNode[] = [];

  for (const hunk of hunks) {
    const oldCount = hunk.ops.filter((op) => op.type !== "insert").length;
    const newCount = hunk.ops.filter((op) => op.type !== "delete").length;
    rows.push(
      <Box key={`hunk-${hunk.oldStart}-${hunk.newStart}`}>
        <Text color="cyan" dimColor>
          @@ -{hunk.oldStart},{oldCount} +{hunk.newStart},{newCount} @@
        </Text>
      </Box>
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
          <Box key={key} gap={2}>
            {showLineNumbers && (
              <Text dimColor color={theme.colors.mutedForeground}>
                {String(currentOl ?? "").padStart(4)}
              </Text>
            )}
            <Text dimColor>{op.line}</Text>
            <Text> {separator} </Text>
            {showLineNumbers && (
              <Text dimColor color={theme.colors.mutedForeground}>
                {String(currentNl ?? "").padStart(4)}
              </Text>
            )}
            <Text dimColor>{op.line}</Text>
          </Box>
        );
      } else if (op.type === "delete") {
        rows.push(
          <Box key={key} gap={2}>
            {showLineNumbers && (
              <Text dimColor color={theme.colors.mutedForeground}>
                {String(currentOl ?? "").padStart(4)}
              </Text>
            )}
            <Text color="red">-{op.line}</Text>
            <Text> {separator} </Text>
            <Text> </Text>
          </Box>
        );
      } else {
        rows.push(
          <Box key={key} gap={2}>
            <Text> </Text>
            <Text> {separator} </Text>
            {showLineNumbers && (
              <Text dimColor color={theme.colors.mutedForeground}>
                {String(currentNl ?? "").padStart(4)}
              </Text>
            )}
            <Text color="green">+{op.line}</Text>
          </Box>
        );
      }
    }
  }

  return <Box flexDirection="column">{rows}</Box>;
};

interface InlineViewProps {
  ops: DiffOp[];
  showLineNumbers: boolean;
  theme: ReturnType<typeof useTheme>;
}

const InlineView = ({ ops, showLineNumbers, theme }: InlineViewProps) => {
  const rows: React.ReactNode[] = [];
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
        <Box key={key} gap={1}>
          {showLineNumbers && (
            <Text color={theme.colors.mutedForeground} dimColor>
              {String(currentOl ?? "").padStart(4)} {"    "}
            </Text>
          )}
          <Text color="red" dimColor>
            -{op.line}
          </Text>
        </Box>
      );
    } else if (op.type === "insert") {
      rows.push(
        <Box key={key} gap={1}>
          {showLineNumbers && (
            <Text color={theme.colors.mutedForeground} dimColor>
              {"    "} {String(currentNl ?? "").padStart(4)}
            </Text>
          )}
          <Text color="green">+{op.line}</Text>
        </Box>
      );
    } else {
      rows.push(
        <Box key={key} gap={1}>
          {showLineNumbers && (
            <Text color={theme.colors.mutedForeground} dimColor>
              {String(currentOl ?? "").padStart(4)}{" "}
              {String(currentNl ?? "").padStart(4)}
            </Text>
          )}
          <Text dimColor> {op.line}</Text>
        </Box>
      );
    }
  }

  return <Box flexDirection="column">{rows}</Box>;
};

export const DiffView = ({
  oldText,
  newText,
  filename,
  mode = "unified",
  context = 3,
  showLineNumbers = false,
  accessibleSummary,
  "aria-label": ariaLabel,
}: DiffViewProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();

  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const ops = computeDiff(oldLines, newLines);
  const hunks = buildHunks(ops, context);
  const hasChanges = ops.some((op) => op.type !== "equal");
  const changes = (() => {
    let oldLine = 1;
    let newLine = 1;
    return ops.flatMap((operation) => {
      const currentOldLine = operation.type === "insert" ? undefined : oldLine;
      const currentNewLine = operation.type === "delete" ? undefined : newLine;
      if (operation.type !== "insert") {
        oldLine += 1;
      }
      if (operation.type !== "delete") {
        newLine += 1;
      }
      return operation.type === "equal"
        ? []
        : [{ ...operation, newLine: currentNewLine, oldLine: currentOldLine }];
    });
  })();

  if (!hasChanges) {
    return (
      <Box flexDirection="column">
        {filename && (
          <Text bold color={theme.colors.foreground}>
            {filename}
          </Text>
        )}
        <Text dimColor color={theme.colors.mutedForeground}>
          No differences
        </Text>
      </Box>
    );
  }

  if (isScreenReaderEnabled) {
    return (
      <Box flexDirection="column" aria-role="list">
        <Text
          aria-label={
            ariaLabel ??
            accessibleSummary ??
            `Diff for ${filename ?? "text"}. ${changes.length} changed lines.`
          }
        >
          {""}
        </Text>
        {changes.slice(0, 200).map((change, index) => (
          <Box
            key={`${change.type}-${change.oldLine ?? "x"}-${change.newLine ?? "x"}-${index}`}
            aria-role="listitem"
          >
            <Text>
              {change.type === "insert"
                ? `Added at new line ${change.newLine}: ${change.line}`
                : `Removed at old line ${change.oldLine}: ${change.line}`}
            </Text>
          </Box>
        ))}
        {changes.length > 200 && (
          <Text>{`${changes.length - 200} additional changed lines omitted.`}</Text>
        )}
      </Box>
    );
  }

  let content: React.ReactNode;
  if (mode === "split") {
    content = (
      <SplitView
        hunks={hunks}
        separator={unicode ? "│" : "|"}
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
        separator={unicode ? "│" : "|"}
        showLineNumbers={showLineNumbers}
        theme={theme}
      />
    );
  }

  return (
    <Box flexDirection="column" aria-label={ariaLabel ?? accessibleSummary}>
      {filename && (
        <Text bold color={theme.colors.foreground}>
          --- {filename}
        </Text>
      )}
      {content}
    </Box>
  );
};
