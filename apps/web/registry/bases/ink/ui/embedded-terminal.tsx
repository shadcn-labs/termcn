import { useIsScreenReaderEnabled, useStdout, Box, Text } from "ink";
import React, { useEffect, useMemo, useRef, useState } from "react";
import stripAnsi from "strip-ansi";

import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

interface IPty {
  kill: () => void;
  onData: (cb: (data: string) => void) => void;
  onExit: (cb: (e: { exitCode: number }) => void) => void;
  resize: (columns: number, rows: number) => void;
}

interface NodePtyModule {
  spawn: (
    command: string,
    args: string[],
    options: { cols: number; cwd?: string; name: string; rows: number }
  ) => IPty;
}

export interface EmbeddedTerminalProps {
  command: string;
  args?: string[];
  cwd?: string;
  width?: number;
  height?: number;
  onExit?: (code: number) => void;
  isActive?: boolean;
  "aria-label"?: string;
}

const EMPTY_ARGS: string[] = [];

/**
 * Renders a pseudo-terminal session inside the TUI.
 * Requires optional dependency `node-pty` (native build).
 */
export const EmbeddedTerminal = ({
  command,
  args = EMPTY_ARGS,
  cwd,
  width = 80,
  height = 24,
  onExit,
  isActive = true,
  "aria-label": ariaLabel,
}: EmbeddedTerminalProps) => {
  const unicode = useUnicode();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
  const { stdout } = useStdout();
  const [raw, setRaw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [terminalColumns, setTerminalColumns] = useState(
    () => stdout.columns ?? width
  );
  const pendingOutput = useRef("");
  const ptyRef = useRef<IPty | null>(null);
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;

  useEffect(() => {
    const updateColumns = () => setTerminalColumns(stdout.columns ?? width);
    updateColumns();
    stdout.on("resize", updateColumns);
    return () => {
      stdout.off("resize", updateColumns);
    };
  }, [stdout, width]);

  const resolvedWidth = Math.max(
    3,
    Math.min(Math.max(3, Math.floor(width)), terminalColumns)
  );
  const ptyColumns = Math.max(
    1,
    resolvedWidth - (isScreenReaderEnabled ? 0 : 2)
  );
  const dimensionsRef = useRef({ columns: ptyColumns, rows: height });
  dimensionsRef.current = { columns: ptyColumns, rows: height };

  useEffect(() => {
    if (!isActive) {
      return;
    }
    let p: IPty | null = null;
    let cancelled = false;

    (async () => {
      try {
        const loadPty = new Function(
          'return import("node-pty")'
        ) as () => Promise<NodePtyModule>;
        const mod = await loadPty();
        if (cancelled) {
          return;
        }
        const dimensions = dimensionsRef.current;
        const pty = mod.spawn(command, args, {
          cols: dimensions.columns,
          cwd,
          name: "xterm-color",
          rows: dimensions.rows,
        });
        p = pty;
        ptyRef.current = pty;
        pty.onData((d: string) => {
          if (isScreenReaderEnabled) {
            pendingOutput.current += d;
            if (!d.includes("\n") && pendingOutput.current.length < 256) {
              return;
            }
            const update = pendingOutput.current;
            pendingOutput.current = "";
            setRaw((previous) => (previous + update).slice(-500_000));
          } else {
            setRaw((previous) => (previous + d).slice(-500_000));
          }
        });
        pty.onExit((e: { exitCode: number }) => {
          onExitRef.current?.(e.exitCode);
        });
      } catch {
        setErr(
          "Install optional peer: node-pty (native build required for your platform)."
        );
      }
    })();

    return () => {
      cancelled = true;
      if (p) {
        p.kill();
      }
      ptyRef.current = null;
    };
  }, [args, command, cwd, isActive, isScreenReaderEnabled]);

  useEffect(() => {
    ptyRef.current?.resize(ptyColumns, height);
  }, [height, ptyColumns]);

  const lines = useMemo(
    () => stripAnsi(raw).split("\n").slice(-height),
    [raw, height]
  );

  return (
    <Box
      flexDirection="column"
      borderStyle={resolveBorderStyle(
        isScreenReaderEnabled ? undefined : "round",
        unicode
      )}
      borderColor="cyan"
      width={resolvedWidth}
      aria-role="list"
    >
      <Text aria-label={ariaLabel ?? `Embedded terminal running ${command}`}>
        {""}
      </Text>
      {err ? (
        <Text color="red">{err}</Text>
      ) : (
        lines.map((line, i) => (
          <Box key={i} aria-role="listitem">
            <Text>{line}</Text>
          </Box>
        ))
      )}
    </Box>
  );
};
