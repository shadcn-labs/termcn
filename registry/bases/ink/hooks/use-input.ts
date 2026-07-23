import { useInput as inkUseInput } from "ink";
import type { Key } from "ink";

/** @deprecated Import Key from Ink or use-interaction instead. */
export type { Key } from "ink";

export type InputHandler = (input: string, key: Key) => void;

/** @deprecated Use useInteraction for focus-scoped component input. */
export const useInput = (
  handler: InputHandler,
  options?: { isActive?: boolean }
): void => {
  inkUseInput(handler, options);
};
