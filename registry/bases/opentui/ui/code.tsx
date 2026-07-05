/* @jsxImportSource @opentui/react */

import { useTheme } from "@/components/ui/opentui-theme-provider";
import type { BorderStyle } from "@/registry/bases/opentui/ui/types";

export interface CodeProps {
  children: string;
  language?: string;
  inline?: boolean;
  borderStyle?: BorderStyle;
  showLineNumbers?: boolean;
  lineNumberSeparator?: string;
  keywordColor?: string;
  stringColor?: string;
  numberColor?: string;
  commentColor?: string;
  operatorColor?: string;
  plainColor?: string;
}

const KEYWORDS = new Set([
  "const",
  "let",
  "var",
  "function",
  "return",
  "if",
  "else",
  "import",
  "export",
  "from",
  "class",
  "interface",
  "type",
  "async",
  "await",
  "new",
  "this",
  "true",
  "false",
  "null",
  "undefined",
  "void",
  "typeof",
  "instanceof",
  "in",
  "of",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "break",
  "continue",
  "try",
  "catch",
  "finally",
  "throw",
  "extends",
  "implements",
  "static",
  "public",
  "private",
  "protected",
  "readonly",
  "enum",
  "default",
  "delete",
  "yield",
  "super",
]);

const OPERATORS = /^[=+\-*/<>!&|?%^~]+$/;

interface Token {
  text: string;
  kind: "keyword" | "string" | "number" | "comment" | "operator" | "plain";
}

const tokenizeLine = (line: string): Token[] => {
  const trimmed = line.trimStart();
  if (trimmed.startsWith("//")) {
    return [{ kind: "comment", text: line }];
  }

  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    if (line[i] === "/" && line[i + 1] === "/") {
      tokens.push({ kind: "comment", text: line.slice(i) });
      break;
    }

    const quote = line[i];
    if (quote === '"' || quote === "'" || quote === "`") {
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === "\\") {
          j += 1;
        }
        j += 1;
      }
      j += 1;
      tokens.push({ kind: "string", text: line.slice(i, j) });
      i = j;
      continue;
    }

    if (/[0-9]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[0-9._xXa-fA-FbBoO]/.test(line[j])) {
        j += 1;
      }
      tokens.push({ kind: "number", text: line.slice(i, j) });
      i = j;
      continue;
    }

    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) {
        j += 1;
      }
      const word = line.slice(i, j);
      tokens.push({
        kind: KEYWORDS.has(word) ? "keyword" : "plain",
        text: word,
      });
      i = j;
      continue;
    }

    if (/[=+\-*/<>!&|?%^~]/.test(line[i])) {
      let j = i;
      while (j < line.length && OPERATORS.test(line[j])) {
        j += 1;
      }
      tokens.push({ kind: "operator", text: line.slice(i, j) });
      i = j;
      continue;
    }

    tokens.push({ kind: "plain", text: line[i] });
    i += 1;
  }

  return tokens;
};

const CodeLine = ({
  line,
  keywordColor,
  stringColor,
  numberColor,
  commentColor: _commentColor,
  operatorColor,
  plainColor,
}: {
  line: string;
  keywordColor: string;
  stringColor: string;
  numberColor: string;
  commentColor: string;
  operatorColor: string;
  plainColor: string;
}) => {
  const tokens = tokenizeLine(line);

  return (
    <box flexDirection="row">
      {tokens.map((token, idx) => {
        switch (token.kind) {
          case "keyword": {
            return (
              <text key={idx} fg={keywordColor}>
                {token.text}
              </text>
            );
          }
          case "string": {
            return (
              <text key={idx} fg={stringColor}>
                {token.text}
              </text>
            );
          }
          case "number": {
            return (
              <text key={idx} fg={numberColor}>
                {token.text}
              </text>
            );
          }
          case "comment": {
            return (
              <text key={idx} fg="#666">
                {token.text}
              </text>
            );
          }
          case "operator": {
            return (
              <text key={idx} fg={operatorColor}>
                {token.text}
              </text>
            );
          }
          default: {
            return (
              <text key={idx} fg={plainColor}>
                {token.text}
              </text>
            );
          }
        }
      })}
    </box>
  );
};

export const Code = ({
  children,
  language,
  inline = false,
  borderStyle = "single",
  showLineNumbers = true,
  lineNumberSeparator = "│ ",
  keywordColor: keywordColorProp,
  stringColor: stringColorProp,
  numberColor: numberColorProp,
  commentColor: commentColorProp,
  operatorColor: operatorColorProp,
  plainColor: plainColorProp,
}: CodeProps) => {
  const theme = useTheme();

  const keywordColor = keywordColorProp ?? theme.colors.accent;
  const stringColor = stringColorProp ?? theme.colors.success;
  const numberColor = numberColorProp ?? theme.colors.warning;
  const commentColor = commentColorProp ?? theme.colors.mutedForeground;
  const operatorColor = operatorColorProp ?? theme.colors.info;
  const plainColor = plainColorProp ?? theme.colors.foreground;

  const lines = children.split("\n");

  if (inline) {
    const displayLine = lines[0] ?? "";
    return (
      <box
        borderColor={theme.colors.border}
        borderStyle={borderStyle}
        paddingLeft={1}
        paddingRight={1}
      >
        <CodeLine
          commentColor={commentColor}
          keywordColor={keywordColor}
          line={displayLine}
          numberColor={numberColor}
          operatorColor={operatorColor}
          plainColor={plainColor}
          stringColor={stringColor}
        />
      </box>
    );
  }

  const lineNumberWidth = String(lines.length).length;

  return (
    <box
      borderColor={theme.colors.border}
      borderStyle={borderStyle}
      flexDirection="column"
    >
      {language ? (
        <box
          key="lang"
          justifyContent="flex-end"
          paddingLeft={1}
          paddingRight={1}
        >
          <text fg={theme.colors.mutedForeground}>{language}</text>
        </box>
      ) : null}
      {lines.map((line, idx) => (
        <box key={idx} flexDirection="row" paddingLeft={1} paddingRight={1}>
          {showLineNumbers ? (
            <>
              <text fg={theme.colors.mutedForeground}>
                {`${String(idx + 1).padStart(lineNumberWidth, " ")} `}
              </text>
              <text fg={theme.colors.mutedForeground}>
                {lineNumberSeparator}
              </text>
            </>
          ) : null}
          <CodeLine
            commentColor={commentColor}
            keywordColor={keywordColor}
            line={line}
            numberColor={numberColor}
            operatorColor={operatorColor}
            plainColor={plainColor}
            stringColor={stringColor}
          />
        </box>
      ))}
    </box>
  );
};
