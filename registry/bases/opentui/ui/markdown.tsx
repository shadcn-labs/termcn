/* @jsxImportSource @opentui/react */
import React from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface MarkdownProps {
  children: string;
  width?: number;
}

interface InlineSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  link?: boolean;
  url?: string;
}

const parseInline = (line: string): InlineSegment[] => {
  const segments: InlineSegment[] = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(line)) !== null) {
    if (match.index > last) {
      segments.push({ text: line.slice(last, match.index) });
    }

    const [full] = match;
    if (full.startsWith("**")) {
      segments.push({ bold: true, text: match[2] });
    } else if (full.startsWith("*")) {
      segments.push({ italic: true, text: match[3] });
    } else if (full.startsWith("`")) {
      segments.push({ code: true, text: match[4] });
    } else if (full.startsWith("[")) {
      segments.push({ link: true, text: match[5], url: match[6] });
    }

    last = match.index + full.length;
  }

  if (last < line.length) {
    segments.push({ text: line.slice(last) });
  }

  return segments;
};

const InlineLine = ({ segments }: { segments: InlineSegment[] }) => {
  const theme = useTheme();

  return (
    <box flexDirection="row">
      {segments.map((seg, i) => {
        if (seg.code) {
          return (
            <text key={i} fg={theme.colors.accent}>
              {seg.text}
            </text>
          );
        }
        if (seg.link) {
          return (
            <box key={i} flexDirection="row">
              <text fg={theme.colors.info}>
                <u>{seg.text}</u>
              </text>
              <text fg="#666">{` (${seg.url})`}</text>
            </box>
          );
        }
        let content: React.ReactNode = seg.text;
        if (seg.bold && seg.italic) {
          content = (
            <b>
              <i>{seg.text}</i>
            </b>
          );
        } else if (seg.bold) {
          content = <b>{seg.text}</b>;
        } else if (seg.italic) {
          content = <i>{seg.text}</i>;
        }
        return <text key={i}>{content}</text>;
      })}
    </box>
  );
};

export const Markdown = ({ children, width }: MarkdownProps) => {
  const theme = useTheme();
  const lines = children.split("\n");

  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const h4 = line.match(/^####\s+(.*)/);
    const h3 = line.match(/^###\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h1 = line.match(/^#\s+(.*)/);

    if (h1) {
      elements.push(
        <text key={i} fg={theme.colors.primary}>
          <b>{h1[1]}</b>
        </text>
      );
    } else if (h2) {
      elements.push(
        <text key={i} fg={theme.colors.primary}>
          <b>{h2[1]}</b>
        </text>
      );
    } else if (h3) {
      elements.push(
        <text key={i} fg={theme.colors.primary}>
          <b>{h3[1]}</b>
        </text>
      );
    } else if (h4) {
      elements.push(
        <text key={i} fg={theme.colors.primary}>
          {h4[1]}
        </text>
      );
    } else if (/^---+$/.test(line)) {
      elements.push(
        <text key={i} fg={theme.colors.border}>
          {"─".repeat(width ?? 40)}
        </text>
      );
    } else if (/^>\s/.test(line)) {
      const content = line.replace(/^>\s/, "");
      elements.push(
        <box key={i} gap={1}>
          <text fg={theme.colors.primary}>│</text>
          <InlineLine segments={parseInline(content)} />
        </box>
      );
    } else if (/^[-*]\s/.test(line)) {
      const content = line.replace(/^[-*]\s/, "");
      elements.push(
        <box key={i} gap={1}>
          <text fg={theme.colors.mutedForeground}>•</text>
          <InlineLine segments={parseInline(content)} />
        </box>
      );
    } else if (line === "") {
      elements.push(<box key={i} />);
    } else {
      elements.push(
        <box key={i} flexWrap="wrap" width={width}>
          <InlineLine segments={parseInline(line)} />
        </box>
      );
    }

    i += 1;
  }

  return <box flexDirection="column">{elements}</box>;
};
