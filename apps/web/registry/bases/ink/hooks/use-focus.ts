import { useFocus as inkUseFocus } from "ink";

export const useFocus = (options?: {
  autoFocus?: boolean;
  id?: string;
  isActive?: boolean;
}) => inkUseFocus(options);
