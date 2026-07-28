import type { ReactElement, ReactNode } from "react";

import type {
  InkComponentDescriptor,
  OpenTuiComponentDescriptor,
} from "./types.js";

export const inkComponent = (node: ReactElement): InkComponentDescriptor => ({
  node,
  runtime: "ink",
});

export const openTuiComponent = (
  node: ReactNode
): OpenTuiComponentDescriptor => ({
  node,
  runtime: "opentui",
});
