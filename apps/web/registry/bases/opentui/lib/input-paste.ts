import * as OpenTUIReact from "@opentui/react";

export interface OpenTUIPasteEvent {
  bytes: Uint8Array;
  preventDefault(): void;
  stopPropagation(): void;
}

type PasteHandler = (event: OpenTUIPasteEvent) => void;
type PasteHook = (handler: PasteHandler) => void;

const pasteHook = Reflect.get(OpenTUIReact as unknown as object, "usePaste") as
  | PasteHook
  | undefined;

const noopPasteHook: PasteHook = () => {
  // Browser preview adapters may omit paste events.
};

export const useInputPaste: PasteHook = pasteHook ?? noopPasteHook;
