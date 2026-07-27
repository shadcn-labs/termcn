import * as React from "react";

const clipboardWrite = (text: string) => {
  const encoded = Buffer.from(text).toString("base64");
  return `]52;c;${encoded}`;
};

export const useClipboard = () => {
  const write = React.useCallback(async (text: string) => {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      await navigator.clipboard.writeText(text);
      return;
    }

    if (typeof process !== "undefined" && process.stdout?.write) {
      process.stdout.write(clipboardWrite(text));
    }
  }, []);

  return { write };
};
