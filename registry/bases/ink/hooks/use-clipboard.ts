import { useStdout } from "ink";
import * as React from "react";

const clipboardWrite = (text: string) => {
  const encoded = Buffer.from(text).toString("base64");
  return `]52;c;${encoded}`;
};

export const useClipboard = () => {
  const { stdout } = useStdout();
  const write = React.useCallback(
    async (text: string) => {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(text);
        return;
      }

      if (stdout.isTTY) {
        stdout.write(clipboardWrite(text));
        return;
      }
      throw new Error("Clipboard is unavailable when output is not a TTY");
    },
    [stdout]
  );

  return { write };
};
