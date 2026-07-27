import { useIsScreenReaderEnabled } from "ink";
import * as React from "react";

import { useMotion } from "@/hooks/use-motion";

type Subscriber = (tick: number) => void;
const pool = new Map<
  number,
  { id: ReturnType<typeof setInterval>; subs: Set<Subscriber>; tick: number }
>();

const subscribe = (milliseconds: number, subscriber: Subscriber) => {
  if (!pool.has(milliseconds)) {
    const entry = {
      id: null as unknown as ReturnType<typeof setInterval>,
      subs: new Set<Subscriber>(),
      tick: 0,
    };

    entry.id = setInterval(() => {
      entry.tick += 1;
      for (const sub of entry.subs) {
        sub(entry.tick);
      }
    }, milliseconds);

    pool.set(milliseconds, entry);
  }

  pool.get(milliseconds)?.subs.add(subscriber);
};

const unsubscribe = (milliseconds: number, subscriber: Subscriber) => {
  const entry = pool.get(milliseconds);
  if (!entry) {
    return;
  }

  entry.subs.delete(subscriber);
  if (entry.subs.size === 0) {
    clearInterval(entry.id);
    pool.delete(milliseconds);
  }
};

export interface UseAnimationOptions {
  intervalMs: number;
  isActive?: boolean;
}

export const useAnimation = (
  rate: number | UseAnimationOptions = 12
): number => {
  const [frame, setFrame] = React.useState(0);
  const { reduced } = useMotion();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
  const milliseconds =
    typeof rate === "number" ? Math.round(1000 / rate) : rate.intervalMs;
  const isActive =
    (typeof rate === "number" ? true : (rate.isActive ?? true)) &&
    !reduced &&
    !isScreenReaderEnabled;

  React.useEffect(() => {
    if (!isActive) {
      setFrame(0);
      return;
    }

    const callback: Subscriber = (tick) => setFrame(tick);
    subscribe(milliseconds, callback);

    return () => unsubscribe(milliseconds, callback);
  }, [isActive, milliseconds]);

  return frame;
};
