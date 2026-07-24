import * as React from "react";

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

export const useAnimation = (
  rate: number | { intervalMs: number } = 12
): number => {
  const [frame, setFrame] = React.useState(0);
  const milliseconds =
    typeof rate === "number" ? Math.round(1000 / rate) : rate.intervalMs;

  React.useEffect(() => {
    const callback: Subscriber = (tick) => setFrame(tick);
    subscribe(milliseconds, callback);

    return () => unsubscribe(milliseconds, callback);
  }, [milliseconds]);

  return frame;
};
