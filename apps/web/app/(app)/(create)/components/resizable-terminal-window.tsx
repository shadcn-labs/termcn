"use client";

import { TerminalIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { TerminalPreview } from "@/components/terminal-preview";
import type { FrameworkName, ThemeName } from "@/lib/create-config";
import { themePrimaryBySlug } from "@/lib/terminal-themes";

import { PreviewResizeHandle } from "./preview-resize-handle";
import type { PreviewResizeEdge } from "./preview-resize-handle";

interface PreviewSize {
  height: number;
  width: number;
}

interface PreviewResizeDrag extends PreviewSize {
  edge: PreviewResizeEdge;
  pointerX: number;
  pointerY: number;
}

export interface ResizableTerminalWindowProps {
  base: FrameworkName;
  frameworkTitle: string;
  name: string;
  templateTitle: string;
  theme: ThemeName;
  themeTitle: string;
}

const MIN_PREVIEW_HEIGHT = 240;
const MIN_PREVIEW_WIDTH = 320;
const PREVIEW_KEYBOARD_STEP = 16;
const TERMINAL_LINE_HEIGHT = 18;
const TERMINAL_VERTICAL_PADDING = 20;
const TERMINAL_WINDOW_HEADER_HEIGHT = 48;
const TERMINAL_WINDOW_GUTTER = 24;
const PREVIEW_KEYBOARD_DELTAS: Record<
  PreviewResizeEdge,
  Readonly<Partial<Record<string, number>>>
> = {
  bottom: {
    ArrowDown: PREVIEW_KEYBOARD_STEP,
    ArrowUp: -PREVIEW_KEYBOARD_STEP,
  },
  left: {
    ArrowLeft: PREVIEW_KEYBOARD_STEP,
    ArrowRight: -PREVIEW_KEYBOARD_STEP,
  },
  right: {
    ArrowLeft: -PREVIEW_KEYBOARD_STEP,
    ArrowRight: PREVIEW_KEYBOARD_STEP,
  },
  top: {
    ArrowDown: -PREVIEW_KEYBOARD_STEP,
    ArrowUp: PREVIEW_KEYBOARD_STEP,
  },
};

export const ResizableTerminalWindow = ({
  base,
  frameworkTitle,
  name,
  templateTitle,
  theme,
  themeTitle,
}: ResizableTerminalWindowProps) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<PreviewResizeDrag | null>(null);
  const [size, setSize] = useState<PreviewSize | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const syncToViewport = () => {
      const maxHeight = Math.max(
        1,
        Math.floor(viewport.clientHeight - TERMINAL_WINDOW_GUTTER * 2)
      );
      const maxWidth = Math.max(
        1,
        Math.floor(viewport.clientWidth - TERMINAL_WINDOW_GUTTER * 2)
      );

      setSize((current) => {
        if (!current) {
          return { height: maxHeight, width: maxWidth };
        }

        return {
          height: Math.min(
            maxHeight,
            Math.max(Math.min(MIN_PREVIEW_HEIGHT, maxHeight), current.height)
          ),
          width: Math.min(
            maxWidth,
            Math.max(Math.min(MIN_PREVIEW_WIDTH, maxWidth), current.width)
          ),
        };
      });
    };

    const observer = new ResizeObserver(syncToViewport);
    observer.observe(viewport);
    syncToViewport();
    return () => observer.disconnect();
  }, []);

  const clampSize = (next: PreviewSize): PreviewSize => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return next;
    }

    const maxHeight = Math.max(
      1,
      viewport.clientHeight - TERMINAL_WINDOW_GUTTER * 2
    );
    const maxWidth = Math.max(
      1,
      viewport.clientWidth - TERMINAL_WINDOW_GUTTER * 2
    );
    return {
      height: Math.min(
        maxHeight,
        Math.max(Math.min(MIN_PREVIEW_HEIGHT, maxHeight), next.height)
      ),
      width: Math.min(
        maxWidth,
        Math.max(Math.min(MIN_PREVIEW_WIDTH, maxWidth), next.width)
      ),
    };
  };

  const startResize = (
    edge: PreviewResizeEdge,
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    if (!size) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      ...size,
      edge,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
  };

  const resizeFromPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }

    let { height, width } = drag;
    if (drag.edge === "left") {
      width += (drag.pointerX - event.clientX) * 2;
    } else if (drag.edge === "right") {
      width += (event.clientX - drag.pointerX) * 2;
    } else if (drag.edge === "top") {
      height += (drag.pointerY - event.clientY) * 2;
    } else {
      height += (event.clientY - drag.pointerY) * 2;
    }

    setSize(clampSize({ height, width }));
  };

  const resizeFromKeyboard = (
    edge: PreviewResizeEdge,
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (!size) {
      return;
    }

    const delta = PREVIEW_KEYBOARD_DELTAS[edge][event.key] ?? 0;
    if (delta === 0) {
      return;
    }

    event.preventDefault();
    setSize(
      clampSize({
        height:
          edge === "bottom" || edge === "top"
            ? size.height + delta
            : size.height,
        width:
          edge === "bottom" || edge === "top" ? size.width : size.width + delta,
      })
    );
  };

  const rows = Math.max(
    1,
    Math.floor(
      ((size?.height ?? MIN_PREVIEW_HEIGHT) -
        TERMINAL_WINDOW_HEADER_HEIGHT -
        TERMINAL_VERTICAL_PADDING) /
        TERMINAL_LINE_HEIGHT
    )
  );

  return (
    <div
      className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-2xl bg-background"
      ref={viewportRef}
    >
      <div
        className="relative min-h-0"
        style={
          size
            ? { height: `${size.height}px`, width: `${size.width}px` }
            : {
                height: `calc(100% - ${TERMINAL_WINDOW_GUTTER * 2}px)`,
                width: `calc(100% - ${TERMINAL_WINDOW_GUTTER * 2}px)`,
              }
        }
      >
        <section className="relative flex h-full w-full min-h-0 flex-col overflow-hidden rounded-2xl bg-(--color-surface) shadow-[0_10px_40px_-12px_rgba(0,0,0,0.2)] ring-1 ring-black/5 dark:ring-white/10">
          <div className="border-border/60 bg-background relative z-10 flex h-12 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-red-500/70" />
              <span className="size-2.5 rounded-full bg-amber-500/70" />
              <span className="size-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <div className="text-muted-foreground ml-2 flex min-w-0 items-center gap-2 text-xs">
              <TerminalIcon className="size-3.5" />
              <span className="truncate">
                {templateTitle} · {frameworkTitle}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundColor: themePrimaryBySlug[theme] ?? "currentColor",
                }}
              />
              <span className="text-muted-foreground hidden text-xs sm:inline">
                {themeTitle}
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden bg-black">
            <TerminalPreview
              base={base}
              name={name}
              rows={rows}
              theme={theme}
            />
          </div>
        </section>

        {(["left", "right", "top", "bottom"] as const).map((edge) => (
          <PreviewResizeHandle
            edge={edge}
            key={edge}
            onKeyDown={resizeFromKeyboard}
            onPointerCancel={() => {
              dragRef.current = null;
            }}
            onPointerDown={startResize}
            onPointerMove={resizeFromPointer}
            onPointerUp={() => {
              dragRef.current = null;
            }}
          />
        ))}
      </div>
    </div>
  );
};
