/* @jsxImportSource @opentui/react */
import * as fs from "node:fs";
import * as path from "node:path";

import { useEffect, useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export type ImageProtocol = "auto" | "iterm2" | "kitty" | "ascii";

export interface ImageProps {
  src: string;
  width?: number;
  height?: number;
  protocol?: ImageProtocol;
  alt?: string;
}

const detectProtocol = (): Exclude<ImageProtocol, "auto"> => {
  const termProgram = process.env["TERM_PROGRAM"] ?? "";
  const term = process.env["TERM"] ?? "";

  if (termProgram === "iTerm.app") {
    return "iterm2";
  }
  if (term === "xterm-kitty" || process.env["KITTY_WINDOW_ID"]) {
    return "kitty";
  }
  return "ascii";
};

const writeIterm2 = (src: string, width?: number, height?: number): void => {
  try {
    const data = fs.readFileSync(src);
    const base64 = data.toString("base64");
    const filename = path.basename(src);
    const size = data.length;
    let args = `name=${Buffer.from(filename).toString("base64")};size=${size};inline=1`;
    if (width) {
      args += `;width=${width}`;
    }
    if (height) {
      args += `;height=${height}`;
    }
    process.stdout.write(`\u001B]1337;File=${args}:${base64}\u0007`);
  } catch {
    /* noop */
  }
};

const writeKitty = (src: string, width?: number, height?: number): void => {
  try {
    const data = fs.readFileSync(src);
    const base64 = data.toString("base64");
    const chunkSize = 4096;
    let offset = 0;
    let first = true;
    while (offset < base64.length) {
      const chunk = base64.slice(offset, offset + chunkSize);
      offset += chunkSize;
      const more = offset < base64.length ? 1 : 0;
      let header: string;
      if (first) {
        const wPart = width ? `,c=${width}` : "";
        const hPart = height ? `,r=${height}` : "";
        header = `a=T,f=100,m=${more}${wPart}${hPart}`;
        first = false;
      } else {
        header = `m=${more}`;
      }
      process.stdout.write(`\u001B_G${header};${chunk}\u001B\\`);
    }
  } catch {
    /* noop */
  }
};

export const Image = ({
  src,
  width = 20,
  height,
  protocol = "auto",
  alt,
}: ImageProps) => {
  const theme = useTheme();
  const [, setRendered] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const resolvedProtocol = protocol === "auto" ? detectProtocol() : protocol;
  const filename = path.basename(src);
  const ext = path.extname(src).toLowerCase();

  useEffect(() => {
    if (resolvedProtocol === "ascii") {
      setRendered(true);
      return;
    }
    try {
      if (resolvedProtocol === "iterm2") {
        writeIterm2(src, width, height);
        setRendered(true);
      } else if (resolvedProtocol === "kitty") {
        writeKitty(src, width, height);
        setRendered(true);
      }
    } catch (error) {
      setRenderError(error instanceof Error ? error.message : String(error));
    }
  }, [src, resolvedProtocol, width, height]);

  if (resolvedProtocol === "ascii" || renderError) {
    const boxWidth = width ?? 20;
    const topBottom = "─".repeat(boxWidth - 2);
    const empty = " ".repeat(boxWidth - 2);
    const label = (alt ?? filename)
      .slice(0, boxWidth - 4)
      .padStart(
        Math.floor((boxWidth - 2) / 2) +
          Math.floor((alt ?? filename).slice(0, boxWidth - 4).length / 2)
      );

    const innerRows = 3;
    const displayLines: string[] = [
      `┌${topBottom}┐`,
      ...Array.from({ length: Math.floor(innerRows / 2) }, () => `│${empty}│`),
      `│ ${label.padEnd(boxWidth - 3)}│`,
      ...Array.from({ length: Math.ceil(innerRows / 2) }, () => `│${empty}│`),
      `└${topBottom}┘`,
    ];

    return (
      <box flexDirection="column" gap={0}>
        {displayLines.map((line, i) => (
          <text key={i} fg={theme.colors.border}>
            {line}
          </text>
        ))}
        {alt && <text fg="#666">{alt}</text>}
        <text fg="#666">{`[${resolvedProtocol === "ascii" ? "ascii fallback" : `error: ${renderError}`}] ${ext}`}</text>
      </box>
    );
  }

  return (
    <box flexDirection="column" gap={0}>
      <text fg="#666">{`${alt ?? filename} [${resolvedProtocol}]`}</text>
    </box>
  );
};
