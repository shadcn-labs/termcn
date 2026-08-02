import * as React from "react";

import {
  isNoUnicode,
  UnicodeContext,
} from "@/registry/bases/ink/hooks/use-unicode";
import type { UnicodeProviderProps } from "@/registry/bases/ink/ui/types";

export type {
  UnicodeContextValue,
  UnicodeProviderProps,
} from "@/registry/bases/ink/ui/types";

export const UnicodeProvider = ({
  children,
  unicode,
}: UnicodeProviderProps) => {
  const value = React.useMemo(
    () => ({ unicode: unicode ?? !isNoUnicode() }),
    [unicode]
  );

  return (
    <UnicodeContext.Provider value={value}>{children}</UnicodeContext.Provider>
  );
};
