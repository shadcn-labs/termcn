import stringWidth from "string-width";

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export const splitGraphemes = (value: string): string[] =>
  Array.from(segmenter.segment(value), ({ segment }) => segment);

export const graphemeLength = (value: string): number =>
  splitGraphemes(value).length;

export const sliceGraphemes = (
  value: string,
  start?: number,
  end?: number
): string => splitGraphemes(value).slice(start, end).join("");

export const insertAtGrapheme = (
  value: string,
  index: number,
  insertedValue: string
): string => {
  const graphemes = splitGraphemes(value);
  const safeIndex = Math.max(0, Math.min(index, graphemes.length));
  graphemes.splice(safeIndex, 0, ...splitGraphemes(insertedValue));
  return graphemes.join("");
};

export const removeGraphemeBefore = (
  value: string,
  index: number
): { value: string; cursor: number } => {
  const graphemes = splitGraphemes(value);
  const safeIndex = Math.max(0, Math.min(index, graphemes.length));

  if (safeIndex === 0) {
    return { cursor: 0, value };
  }

  graphemes.splice(safeIndex - 1, 1);
  return { cursor: safeIndex - 1, value: graphemes.join("") };
};

export const removeGraphemeAt = (
  value: string,
  index: number
): { value: string; cursor: number } => {
  const graphemes = splitGraphemes(value);
  const safeIndex = Math.max(0, Math.min(index, graphemes.length));

  if (safeIndex >= graphemes.length) {
    return { cursor: safeIndex, value };
  }

  graphemes.splice(safeIndex, 1);
  return { cursor: safeIndex, value: graphemes.join("") };
};

export const terminalWidth = (value: string): number => stringWidth(value);

export const cursorCellOffset = (value: string, cursor: number): number =>
  stringWidth(sliceGraphemes(value, 0, cursor));

export const truncateToTerminalWidth = (
  value: string,
  maximumWidth: number,
  ellipsis = "…"
): string => {
  if (maximumWidth <= 0) {
    return "";
  }

  if (stringWidth(value) <= maximumWidth) {
    return value;
  }

  const ellipsisWidth = stringWidth(ellipsis);
  if (ellipsisWidth >= maximumWidth) {
    return ellipsisWidth === maximumWidth ? ellipsis : "";
  }

  const allowedWidth = maximumWidth - ellipsisWidth;
  let width = 0;
  const output: string[] = [];

  for (const grapheme of splitGraphemes(value)) {
    const nextWidth = stringWidth(grapheme);
    if (width + nextWidth > allowedWidth) {
      break;
    }

    output.push(grapheme);
    width += nextWidth;
  }

  return `${output.join("")}${ellipsis}`;
};

export const padToTerminalWidth = (
  value: string,
  width: number,
  alignment: "left" | "right" = "left"
): string => {
  const padding = " ".repeat(Math.max(0, width - stringWidth(value)));
  return alignment === "right" ? `${padding}${value}` : `${value}${padding}`;
};
