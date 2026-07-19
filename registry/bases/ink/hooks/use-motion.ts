import * as React from "react";

import type { MotionContextValue } from "@/registry/bases/ink/ui/types";

const getEnv = (name: string): string | undefined =>
  typeof process !== "undefined" && process.env ? process.env[name] : undefined;

export const isReducedMotion = (): boolean =>
  getEnv("NO_MOTION") === "1" || getEnv("CI") === "true";

export const MotionContext = React.createContext<MotionContextValue>({
  reduced: isReducedMotion(),
});

export const useMotion = (): MotionContextValue =>
  React.useContext(MotionContext);
