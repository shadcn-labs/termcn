import { useFocus as inkUseFocus } from "ink";

/** @deprecated Import useFocus from Ink or use useInteraction instead. */
export const useFocus = (options?: {
  autoFocus?: boolean;
  id?: string;
  isActive?: boolean;
}) => inkUseFocus(options);
