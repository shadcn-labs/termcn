import { useSyncExternalStore } from "react";

const subscribe = () => () => {
  /* empty */
};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export const useMounted = () => {
  const isMounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return isMounted;
};
