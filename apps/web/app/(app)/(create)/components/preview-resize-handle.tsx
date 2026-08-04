"use client";

import { cn } from "@/lib/utils";

export type PreviewResizeEdge = "bottom" | "left" | "right" | "top";

export interface PreviewResizeHandleProps {
  edge: PreviewResizeEdge;
  onKeyDown: (
    edge: PreviewResizeEdge,
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => void;
  onPointerCancel: () => void;
  onPointerDown: (
    edge: PreviewResizeEdge,
    event: React.PointerEvent<HTMLButtonElement>
  ) => void;
  onPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: () => void;
}

export const PreviewResizeHandle = ({
  edge,
  onKeyDown,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: PreviewResizeHandleProps) => {
  const isSide = edge === "left" || edge === "right";
  const style: React.CSSProperties = isSide
    ? {
        cursor: "ew-resize",
        height: "100%",
        position: "absolute",
        top: "0px",
        userSelect: "none",
        width: "20px",
        ...(edge === "left" ? { left: "-20px" } : { right: "-20px" }),
      }
    : {
        cursor: "ns-resize",
        height: "20px",
        left: "0px",
        position: "absolute",
        userSelect: "none",
        width: "100%",
        ...(edge === "top" ? { top: "-20px" } : { bottom: "-20px" }),
      };

  return (
    <button
      aria-label={`Resize terminal preview from the ${edge}`}
      className="z-20 touch-none border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
      style={style}
      type="button"
      onKeyDown={(event) => onKeyDown(edge, event)}
      onPointerCancel={onPointerCancel}
      onPointerDown={(event) => onPointerDown(edge, event)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div
        className={cn(
          "group absolute flex items-center justify-center",
          isSide ? "inset-y-0 w-[28px]" : "inset-x-0 h-[28px]",
          edge === "left" && "-left-1",
          edge === "right" && "-right-1",
          edge === "top" && "-top-1",
          edge === "bottom" && "-bottom-1"
        )}
      >
        <div
          className={cn(
            "rounded-full bg-black/15 group-hover:bg-black/20 group-active:bg-black/25 dark:bg-white/20 dark:group-hover:bg-white/25 dark:group-active:bg-white/30",
            isSide ? "h-12 w-[4px]" : "h-[4px] w-12"
          )}
        />
      </div>
    </button>
  );
};
