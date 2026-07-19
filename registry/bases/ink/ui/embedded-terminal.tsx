import { useIsScreenReaderEnabled, Box, Text } from "ink";
import { useEffect, useMemo, useRef, useState } from "react";
import stripAnsi from "strip-ansi";

import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

interface IPty {
  kill: () => void;
  onData: (cb: (data: string) => void) => void;
  onExit: (cb: (e: { exitCode: number }) => void) => void;
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

/**
 * Renders a pseudo-terminal session inside the TUI.
 * Requires optional dependency `node-pty` (native build).
 */
export const EmbeddedTerminal = ({
  command,
  args = [],
  cwd,
  width = 80,
  height = 24,
  onExit,
  isActive = true,
  "aria-label": ariaLabel,
}: EmbeddedTerminalProps) => {
  const unicode = useUnicode();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
  const [raw, setRaw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const pendingOutput = useRef("");

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
        const pty = mod.spawn(command, args, {
          cols: width,
          cwd,
          name: "xterm-color",
          rows: height,
        });
        p = pty;
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
          onExit?.(e.exitCode);
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
    };
  }, [
    args,
    command,
    cwd,
    height,
    isActive,
    isScreenReaderEnabled,
    onExit,
    width,
  ]);

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
      width={width}
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
