import { useCallback, useRef } from "react";

export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export const useIconAnimation = <
  T extends AnimatedIconHandle = AnimatedIconHandle,
>() => {
  const iconRef = useRef<T>(null);

  const onMouseEnter = useCallback(() => {
    iconRef.current?.startAnimation();
  }, []);

  const onMouseLeave = useCallback(() => {
    iconRef.current?.stopAnimation();
  }, []);

  return { iconRef, onMouseEnter, onMouseLeave };
};
