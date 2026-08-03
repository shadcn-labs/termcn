declare module "@opentui/react" {
  import type { ReactNode } from "react";

  export function createRoot(renderer: unknown): {
    render(node: ReactNode): void;
  };

  export function useKeyboard(
    handler: (key: {
      name: string;
      defaultPrevented?: boolean;
      ctrl?: boolean;
      shift?: boolean;
      meta?: boolean;
      option?: boolean;
      raw?: string;
      repeated?: boolean;
      sequence?: string;
      super?: boolean;
      hyper?: boolean;
      eventType?: string;
    }) => void,
    options?: { release?: boolean }
  ): void;

  export function useRenderer(): unknown;
  export function useOnResize(
    callback: (width: number, height: number) => void
  ): void;
  export function useTerminalDimensions(): { width: number; height: number };
  export function useTimeline(options?: Record<string, unknown>): unknown;
}
