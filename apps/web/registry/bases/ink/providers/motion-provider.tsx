import * as React from "react";

import { isReducedMotion, MotionContext } from "@/hooks/use-motion";
import type { MotionProviderProps } from "@/registry/bases/ink/ui/types";

export type {
  MotionContextValue,
  MotionProviderProps,
} from "@/registry/bases/ink/ui/types";

export const MotionProvider = ({
  children,
  reducedMotion,
}: MotionProviderProps) => {
  const value = React.useMemo(
    () => ({ reduced: reducedMotion ?? isReducedMotion() }),
    [reducedMotion]
  );

  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
};
