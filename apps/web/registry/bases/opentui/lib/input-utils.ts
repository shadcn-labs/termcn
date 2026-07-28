export interface OpenTUIInputKey {
  name: string;
  sequence?: string;
  ctrl?: boolean;
  meta?: boolean;
  option?: boolean;
  super?: boolean;
  hyper?: boolean;
}

const NON_PRINTABLE_KEYS = new Set([
  "backspace",
  "delete",
  "down",
  "end",
  "enter",
  "escape",
  "home",
  "insert",
  "left",
  "linefeed",
  "pagedown",
  "pageup",
  "return",
  "right",
  "tab",
  "up",
]);

const ESCAPE = String.fromCodePoint(27);
const BELL = String.fromCodePoint(7);
const ANSI_PATTERN = new RegExp(
  `${ESCAPE}(?:\\][^${BELL}]*(?:${BELL}|${ESCAPE}\\\\)|\\[[0-?]*[ -/]*[@-~])`,
  "gu"
);

export const getKeyText = (key: OpenTUIInputKey): string => {
  if (key.ctrl || key.meta || key.option || key.super || key.hyper) {
    return "";
  }

  if (key.name === "space") {
    return " ";
  }

  if (NON_PRINTABLE_KEYS.has(key.name)) {
    return "";
  }

  const sequence = key.sequence ?? (key.name.length === 1 ? key.name : "");

  if (
    !sequence ||
    sequence.startsWith(ESCAPE) ||
    [...sequence].some((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint < 32 || codePoint === 127;
    })
  ) {
    return "";
  }

  return sequence;
};

export const decodePaste = (bytes: Uint8Array): string =>
  new TextDecoder().decode(bytes).replace(ANSI_PATTERN, "");

export const toSingleLine = (value: string): string =>
  value.replaceAll("\r", "").replaceAll("\n", "");

export const insertAt = (
  value: string,
  cursorOffset: number,
  input: string
): string => value.slice(0, cursorOffset) + input + value.slice(cursorOffset);

export const deleteBackwardAt = (
  value: string,
  cursorOffset: number
): { cursorOffset: number; value: string } => {
  if (cursorOffset <= 0) {
    return { cursorOffset: 0, value };
  }

  const nextCursorOffset = cursorOffset - 1;
  return {
    cursorOffset: nextCursorOffset,
    value: value.slice(0, nextCursorOffset) + value.slice(nextCursorOffset + 1),
  };
};

export const deleteForwardAt = (
  value: string,
  cursorOffset: number
): string => {
  if (cursorOffset >= value.length) {
    return value;
  }

  return value.slice(0, cursorOffset) + value.slice(cursorOffset + 1);
};
