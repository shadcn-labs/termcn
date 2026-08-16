import type { BoxProps } from "ink";

export const resolveBorderStyle = (
  borderStyle: BoxProps["borderStyle"],
  unicode: boolean
): BoxProps["borderStyle"] =>
  unicode || borderStyle === undefined ? borderStyle : "classic";
