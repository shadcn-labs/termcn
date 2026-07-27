import { Box, Text } from "ink";
import React from "react";

import { useAnimation } from "@/hooks/use-animation";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";

export interface MarkdownProps {
  children: string;
  width?: number;
  streaming?: boolean;
  cursor?: string;
  isActive?: boolean;
  "aria-label"?: string;
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
    <Box>
      {segments.map((seg, i) => {
        if (seg.code) {
          return (
            <Text key={i} color={theme.colors.accent}>
              {seg.text}
            </Text>
          );
        }
        if (seg.link) {
          return (
            <Box key={i}>
              <Text underline color={theme.colors.info}>
                {seg.text}
              </Text>
              <Text dimColor color={theme.colors.mutedForeground}>
                {" "}
                ({seg.url})
              </Text>
            </Box>
          );
        }
        return (
          <Text key={i} bold={seg.bold} italic={seg.italic}>
            {seg.text}
          </Text>
        );
      })}
    </Box>
  );
};

const sanitizePartialFences = (text: string): string => {
  const fenceCount = (text.match(/```/g) ?? []).length;
  if (fenceCount % 2 !== 0) {
    return `${text}\n\`\`\``;
  }
  return text;
};

export const Markdown = ({
  children,
  width,
  streaming = false,
  cursor,
  isActive = true,
  "aria-label": ariaLabel,
}: MarkdownProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedCursor = cursor ?? (unicode ? "▌" : "|");
  const cursorFrame = useAnimation({
    intervalMs: 530,
    isActive: streaming && isActive,
  });
  const cursorVisible = cursorFrame % 2 === 0;

  const safeChildren = streaming ? sanitizePartialFences(children) : children;
  const lines = safeChildren.split("\n");

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
        <Text key={i} bold color={theme.colors.primary}>
          {h1[1]}
        </Text>
      );
    } else if (h2) {
      elements.push(
        <Text key={i} bold color={theme.colors.primary}>
          {h2[1]}
        </Text>
      );
    } else if (h3) {
      elements.push(
        <Text key={i} bold color={theme.colors.primary}>
          {h3[1]}
        </Text>
      );
    } else if (h4) {
      elements.push(
        <Text key={i} color={theme.colors.primary}>
          {h4[1]}
        </Text>
      );
    } else if (/^---+$/.test(line)) {
      elements.push(
        <Text key={i} color={theme.colors.border}>
          {(unicode ? "─" : "-").repeat(width ?? 40)}
        </Text>
      );
    } else if (/^>\s/.test(line)) {
      const content = line.replace(/^>\s/, "");
      elements.push(
        <Box key={i} gap={1}>
          <Text color={theme.colors.primary}>{unicode ? "│" : "|"}</Text>
          <InlineLine segments={parseInline(content)} />
        </Box>
      );
    } else if (/^[-*]\s/.test(line)) {
      const content = line.replace(/^[-*]\s/, "");
      elements.push(
        <Box key={i} gap={1}>
          <Text color={theme.colors.mutedForeground}>
            {unicode ? "•" : "*"}
          </Text>
          <InlineLine segments={parseInline(content)} />
        </Box>
      );
    } else if (line === "") {
      elements.push(<Box key={i} />);
    } else {
      elements.push(
        <Box key={i} flexWrap="wrap" width={width}>
          <InlineLine segments={parseInline(line)} />
        </Box>
      );
    }

    i += 1;
  }

  if (streaming && cursorVisible && elements.length > 0) {
    const last = elements.at(-1);
    elements[elements.length - 1] = (
      <Box key={`cursor-wrapper-${elements.length - 1}`} flexDirection="row">
        {last}
        <Text aria-hidden color={theme.colors.primary}>
          {resolvedCursor}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      aria-label={ariaLabel}
      aria-state={{ busy: streaming }}
    >
      {elements}
    </Box>
  );
};
