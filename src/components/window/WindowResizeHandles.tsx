"use client";

import { useCallback, useRef } from "react";
import {
  RESIZE_CORNER,
  RESIZE_CURSORS,
  RESIZE_EDGE,
  type ResizeDirection,
  computeResizedWindow,
} from "./resizeUtils";

interface WindowResizeHandlesProps {
  windowId: string;
  disabled?: boolean;
  dockArea?: number;
  onResizeStart: () => void;
  onResizeEnd: () => void;
  onResize: (updates: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  getWindowRect: () => { x: number; y: number; width: number; height: number };
  onFocus: () => void;
}

const HANDLES: { dir: ResizeDirection; className: string; style: React.CSSProperties }[] = [
  { dir: "nw", className: "resize-corner resize-nw", style: { top: 0, left: 0, width: RESIZE_CORNER, height: RESIZE_CORNER } },
  { dir: "ne", className: "resize-corner resize-ne", style: { top: 0, right: 0, width: RESIZE_CORNER, height: RESIZE_CORNER } },
  { dir: "sw", className: "resize-corner resize-sw", style: { bottom: 0, left: 0, width: RESIZE_CORNER, height: RESIZE_CORNER } },
  { dir: "se", className: "resize-corner resize-se", style: { bottom: 0, right: 0, width: RESIZE_CORNER, height: RESIZE_CORNER } },
  {
    dir: "n",
    className: "resize-edge resize-n",
    style: { top: 0, left: RESIZE_CORNER, right: RESIZE_CORNER, height: RESIZE_EDGE },
  },
  {
    dir: "s",
    className: "resize-edge resize-s",
    style: { bottom: 0, left: RESIZE_CORNER, right: RESIZE_CORNER, height: RESIZE_EDGE },
  },
  {
    dir: "w",
    className: "resize-edge resize-w",
    style: { top: RESIZE_CORNER, bottom: RESIZE_CORNER, left: 0, width: RESIZE_EDGE },
  },
  {
    dir: "e",
    className: "resize-edge resize-e",
    style: { top: RESIZE_CORNER, bottom: RESIZE_CORNER, right: 0, width: RESIZE_EDGE },
  },
];

export function WindowResizeHandles({
  windowId,
  disabled,
  dockArea,
  onResizeStart,
  onResizeEnd,
  onResize,
  getWindowRect,
  onFocus,
}: WindowResizeHandlesProps) {
  const rafRef = useRef<number | null>(null);
  const pendingRect = useRef<ReturnType<typeof computeResizedWindow> | null>(null);

  const flushResize = useCallback(() => {
    rafRef.current = null;
    if (pendingRect.current) {
      onResize(pendingRect.current);
      pendingRect.current = null;
    }
  }, [onResize]);

  const startResize = useCallback(
    (direction: ResizeDirection, e: React.PointerEvent) => {
      if (disabled) return;

      e.preventDefault();
      e.stopPropagation();
      onFocus();

      const start = getWindowRect();
      const pointerStart = { x: e.clientX, y: e.clientY };

      onResizeStart();
      document.body.style.cursor = RESIZE_CURSORS[direction];
      document.body.style.userSelect = "none";

      const onPointerMove = (ev: PointerEvent) => {
        const dx = ev.clientX - pointerStart.x;
        const dy = ev.clientY - pointerStart.y;

        pendingRect.current = computeResizedWindow({
          direction,
          start,
          dx,
          dy,
          viewportWidth: globalThis.innerWidth,
          viewportHeight: globalThis.innerHeight,
          dockArea,
        });

        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(flushResize);
        }
      };

      const onPointerUp = () => {
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointercancel", onPointerUp);

        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        if (pendingRect.current) {
          onResize(pendingRect.current);
          pendingRect.current = null;
        }

        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        onResizeEnd();
      };

      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
      document.addEventListener("pointercancel", onPointerUp);
    },
    [disabled, dockArea, flushResize, getWindowRect, onFocus, onResize, onResizeEnd, onResizeStart]
  );

  if (disabled) return null;

  return (
    <div className="resize-handles" aria-hidden>
      {HANDLES.map(({ dir, className, style }) => (
        <div
          key={`${windowId}-${dir}`}
          className={className}
          style={{ ...style, cursor: RESIZE_CURSORS[dir] }}
          onPointerDown={(e) => startResize(dir, e)}
        />
      ))}
    </div>
  );
}
