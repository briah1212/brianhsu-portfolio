"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import { getAppConfig } from "@/config/apps";
import { AppContainer } from "@/components/apps/AppContainer";
import { WindowResizeHandles } from "./WindowResizeHandles";
import { DOCK_AREA, MENU_BAR_HEIGHT } from "./resizeUtils";
import type { WindowState } from "@/types";

interface WindowProps {
  window: WindowState;
}

export function Window({ window: win }: WindowProps) {
  const {
    focusWindow,
    closeWindow,
    minimizeWindow,
    updateWindow,
    activeWindowId,
    genieOrigin,
    genieAppId,
    clearGenieOrigin,
    theme,
  } = useWindowStore();

  const isActive = activeWindowId === win.id;
  const config = getAppConfig(win.appId);
  const windowRef = useRef<HTMLDivElement>(null);
  const winRectRef = useRef({ x: win.x, y: win.y, width: win.width, height: win.height });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, winX: 0, winY: 0 });
  const dragRafRef = useRef<number | null>(null);
  const pendingDrag = useRef<{ x: number; y: number } | null>(null);

  winRectRef.current = { x: win.x, y: win.y, width: win.width, height: win.height };

  const shouldGenie = genieAppId === win.appId && genieOrigin !== null;

  useEffect(() => {
    if (shouldGenie) {
      const timer = setTimeout(clearGenieOrigin, 600);
      return () => clearTimeout(timer);
    }
  }, [shouldGenie, clearGenieOrigin]);

  const getGenieVariants = () => {
    if (!shouldGenie || !genieOrigin) {
      return {
        initial: { opacity: 0, scale: 0.92 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.88, transition: { duration: 0.2 } },
      };
    }

    return {
      initial: {
        opacity: 0.5,
        scaleX: 0.06,
        scaleY: 0.03,
        borderRadius: 24,
      },
      animate: {
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
        borderRadius: 12,
        transition: {
          type: "spring" as const,
          stiffness: 340,
          damping: 26,
          mass: 0.75,
        },
      },
      exit: {
        opacity: 0,
        scaleX: 0.08,
        scaleY: 0.04,
        transition: { duration: 0.22, ease: "easeIn" as const },
      },
    };
  };

  const transformOrigin =
    shouldGenie && genieOrigin
      ? `${genieOrigin.x - win.x}px ${genieOrigin.y - win.y}px`
      : "center center";

  const flushDrag = useCallback(() => {
    dragRafRef.current = null;
    if (pendingDrag.current) {
      updateWindow(win.id, pendingDrag.current);
      pendingDrag.current = null;
    }
  }, [updateWindow, win.id]);

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      if (win.isMaximized || isResizing) return;
      e.preventDefault();
      focusWindow(win.id);
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        winX: win.x,
        winY: win.y,
      };

      const onPointerMove = (ev: PointerEvent) => {
        const dx = ev.clientX - dragStart.current.x;
        const dy = ev.clientY - dragStart.current.y;
        const maxX = globalThis.innerWidth - win.width;
        const maxY = globalThis.innerHeight - win.height - DOCK_AREA;
        pendingDrag.current = {
          x: Math.max(0, Math.min(maxX, dragStart.current.winX + dx)),
          y: Math.max(MENU_BAR_HEIGHT, Math.min(maxY, dragStart.current.winY + dy)),
        };
        if (dragRafRef.current === null) {
          dragRafRef.current = requestAnimationFrame(flushDrag);
        }
      };

      const onPointerUp = () => {
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointercancel", onPointerUp);
        if (dragRafRef.current !== null) {
          cancelAnimationFrame(dragRafRef.current);
          dragRafRef.current = null;
        }
        if (pendingDrag.current) {
          updateWindow(win.id, pendingDrag.current);
          pendingDrag.current = null;
        }
        setIsDragging(false);
      };

      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
      document.addEventListener("pointercancel", onPointerUp);
    },
    [win.isMaximized, isResizing, focusWindow, win.x, win.y, win.width, win.height, win.id, updateWindow, flushDrag]
  );

  const getWindowRect = useCallback(() => winRectRef.current, []);

  const handleResize = useCallback(
    (updates: { x: number; y: number; width: number; height: number }) => {
      updateWindow(win.id, updates);
    },
    [updateWindow, win.id]
  );

  if (win.isMinimized) return null;

  const variants = getGenieVariants();

  return (
    <motion.div
      ref={windowRef}
      className={`window absolute flex flex-col overflow-hidden ${
        theme === "dark" ? "window-dark" : "window-light"
      } ${isActive ? "window-active" : "window-inactive"} ${
        isResizing ? "window-resizing" : ""
      } ${isDragging ? "window-dragging" : ""}`}
      style={{
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
        transformOrigin,
      }}
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      onPointerDown={() => focusWindow(win.id)}
      layout={false}
    >
      <div
        className="title-bar relative flex h-9 shrink-0 cursor-default select-none items-center gap-2 px-3"
        onPointerDown={handleDragStart}
      >
        <div className="title-bar-controls pointer-events-auto absolute left-3 top-1/2 z-30 flex -translate-y-1/2 items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(win.id);
            }}
            className="traffic-light traffic-close"
            aria-label="Close"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(win.id);
            }}
            className="traffic-light traffic-minimize"
            aria-label="Minimize"
          />
          <button
            className="traffic-light traffic-maximize cursor-default opacity-50"
            aria-label="Maximize"
            disabled
          />
        </div>
        <div className="w-[52px] shrink-0" />
        <span className="flex-1 truncate text-center text-xs font-medium text-foreground/70">
          {win.route ? win.title : config?.title ?? win.title}
        </span>
        <div className="w-[52px] shrink-0" />
      </div>

      <div className="flex-1 overflow-hidden">
        <AppContainer appId={win.appId} windowId={win.id} route={win.route} />
      </div>

      <WindowResizeHandles
        windowId={win.id}
        disabled={win.isMaximized}
        onFocus={() => focusWindow(win.id)}
        onResizeStart={() => setIsResizing(true)}
        onResizeEnd={() => setIsResizing(false)}
        onResize={handleResize}
        getWindowRect={getWindowRect}
      />
    </motion.div>
  );
}

export function WindowManager() {
  const windows = useWindowStore((s) => s.windows);

  return (
    <AnimatePresence>
      {windows.map((win) => (
        <Window key={win.id} window={win} />
      ))}
    </AnimatePresence>
  );
}
