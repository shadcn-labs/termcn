import * as React from "react";

import type { UnicodeContextValue } from "@/registry/bases/ink/ui/types";

const getEnv = (name: string): string | undefined =>
  typeof process !== "undefined" && process.env ? process.env[name] : undefined;

const detectUnicodeSupport = (): boolean => {
  if (typeof window !== "undefined") {
    return true;
  }

  if (getEnv("NO_UNICODE") === "1" || getEnv("NO_UNICODE") === "true") {
    return false;
  }

  const platform =
    typeof process !== "undefined" && process.platform
      ? process.platform
      : "browser";

  if (getEnv("WSL_DISTRO_NAME")) {
    return true;
  }
  if (getEnv("WT_SESSION")) {
    return true;
  }
  if (getEnv("TERM_PROGRAM") === "vscode") {
    return true;
  }
  if (getEnv("MSYSTEM")) {
    return false;
  }
  if (platform === "darwin" || platform === "linux") {
    return true;
  }

  return true;
};

export const isNoUnicode = (): boolean => !detectUnicodeSupport();

export const UnicodeContext = React.createContext<UnicodeContextValue>({
  unicode: !isNoUnicode(),
});

export const useUnicode = (): boolean =>
  React.useContext(UnicodeContext).unicode;
