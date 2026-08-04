export * from "ink-web";

interface CursorPosition {
  x: number;
  y: number;
}

const cursor = {
  setCursorPosition: (position: CursorPosition | undefined) => {
    // Browser previews use the component's visual cursor fallback.
    void position;
  },
};

/** Browser-only compatibility for Ink APIs that ink-web does not expose. */
export const useCursor = () => cursor;
