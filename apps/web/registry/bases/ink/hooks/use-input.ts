import { useInput as inkUseInput } from "ink";

export interface Key {
  upArrow: boolean;
  downArrow: boolean;
  leftArrow: boolean;
  rightArrow: boolean;
  pageDown: boolean;
  pageUp: boolean;
  return: boolean;
  escape: boolean;
  ctrl: boolean;
  shift: boolean;
  tab: boolean;
  backspace: boolean;
  delete: boolean;
  meta: boolean;
  eventType?: "press" | "repeat" | "release";
  home?: boolean;
  end?: boolean;
  fn?: boolean;
}

export type InputHandler = (input: string, key: Key) => void;

export const useInput = (
  handler: InputHandler,
  options?: { isActive?: boolean }
): void => {
  inkUseInput(handler, options);
};
