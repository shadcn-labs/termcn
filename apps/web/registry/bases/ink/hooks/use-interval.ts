import { useIsScreenReaderEnabled } from "ink";
import * as React from "react";

import { useMotion } from "@/hooks/use-motion";

export interface UseIntervalOptions {
  isActive?: boolean;
  respectMotion?: boolean;
}

export const useInterval = (
  callback: () => void,
  delay: number | null,
  options: UseIntervalOptions = {}
): void => {
  const savedCallback = React.useRef(callback);
  const { reduced } = useMotion();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
  const respectMotion = options.respectMotion ?? true;
  const isActive =
    options.isActive !== false &&
    (!respectMotion || (!reduced && !isScreenReaderEnabled));

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    if (delay === null || !isActive) {
      return;
    }

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay, isActive]);
};
