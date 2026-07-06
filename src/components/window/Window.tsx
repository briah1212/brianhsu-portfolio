"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
} from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import { getAppConfig } from "@/config/apps";
import { AppContainer } from "@/components/apps/AppContainer";
import { WindowResizeHandles } from "./WindowResizeHandles";
import {
  getEffectiveDockArea,
  getMaximizedWindowBounds,
  getWindowBoundsTarget,
  MENU_BAR_HEIGHT,
} from "./resizeUtils";
import type { WindowState } from "@/types";
import type { Transition } from "framer-motion";

const MAXIMIZE_SPRING: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 34,
  mass: 0.9,
};

interface WindowProps {
  window: WindowState;
}

export function Window({ window: win }: WindowProps) {
  const {
    focusWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    updateWindow,
    activeWindowId,
    genieOrigin,
    genieAppId,
    clearGenieOrigin,
    theme,
    dockVisible,
  } = useWindowStore();

  const effectiveDockArea = getEffectiveDockArea(dockVisible);

  const isActive = activeWindowId === win.id;
  const config = getAppConfig(win.appId);
  const windowRef = useRef<HTMLDivElement>(null);
  const winRectRef = useRef({ x: win.x, y: win.y, width: win.width, height: win.height });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isViewportSync, setIsViewportSync] = useState(false);
  const [isAnimatingBounds, setIsAnimatingBounds] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, winX: 0, winY: 0 });
  const dragSizeRef = useRef({ width: win.width, height: win.height });
  const dragRafRef = useRef<number | null>(null);
  const pendingDrag = useRef<{ x: number; y: number } | null>(null);
  const boundsLeft = useMotionValue(win.x);
  const boundsTop = useMotionValue(win.y);
  const boundsWidth = useMotionValue(win.width);
  const boundsHeight = useMotionValue(win.height);
  const boundsRadius = useMotionValue(win.isMaximized ? 0 : 12);
  const winIdRef = useRef(win.id);
  winIdRef.current = win.id;

  const isRestoring =
    !win.isMaximized && win.preMaximizeBounds !== undefined;

  winRectRef.current = isRestoring
    ? {
        x: win.preMaximizeBounds!.x,
        y: win.preMaximizeBounds!.y,
        width: win.preMaximizeBounds!.width,
        height: win.preMaximizeBounds!.height,
      }
    : { x: win.x, y: win.y, width: win.width, height: win.height };

  const shouldGenie = genieAppId === win.appId && genieOrigin !== null;

  useEffect(() => {
    setHasEntered(true);
  }, []);

  useEffect(() => {
    if (shouldGenie) {
      const timer = setTimeout(clearGenieOrigin, 600);
      return () => clearTimeout(timer);
    }
  }, [shouldGenie, clearGenieOrigin]);

  useEffect(() => {
    if (!win.isMaximized) return;

    const syncMaximizedBounds = () => {
      setIsViewportSync(true);
      const area = getEffectiveDockArea(useWindowStore.getState().dockVisible);
      updateWindow(win.id, getMaximizedWindowBounds(undefined, undefined, area));
    };

    globalThis.addEventListener("resize", syncMaximizedBounds);
    return () => globalThis.removeEventListener("resize", syncMaximizedBounds);
  }, [win.isMaximized, win.id, updateWindow]);

  useEffect(() => {
    if (!isViewportSync) return;
    const frame = requestAnimationFrame(() => setIsViewportSync(false));
    return () => cancelAnimationFrame(frame);
  }, [isViewportSync, win.x, win.y, win.width, win.height]);

  useEffect(() => {
    const targets = getWindowBoundsTarget(win, effectiveDockArea);
    const isMaximizeTransition = win.isMaximized || isRestoring;
    const instant = isDragging || isResizing || isViewportSync;

    if (instant) {
      boundsLeft.jump(targets.x);
      boundsTop.jump(targets.y);
      boundsWidth.jump(targets.width);
      boundsHeight.jump(targets.height);
      boundsRadius.jump(targets.radius);
      return;
    }

    if (isMaximizeTransition) {
      setIsAnimatingBounds(true);
    }

    const controls = [
      animate(boundsLeft, targets.x, MAXIMIZE_SPRING),
      animate(boundsTop, targets.y, MAXIMIZE_SPRING),
      animate(boundsWidth, targets.width, MAXIMIZE_SPRING),
      animate(boundsHeight, targets.height, MAXIMIZE_SPRING),
      animate(boundsRadius, targets.radius, MAXIMIZE_SPRING),
    ];

    let cancelled = false;

    void Promise.all(controls).then(() => {
      if (cancelled) return;

      if (isMaximizeTransition) {
        const state = useWindowStore.getState();
        const current = state.windows.find((w) => w.id === winIdRef.current);
        if (current && !current.isMaximized && current.preMaximizeBounds) {
          state.commitRestoreBounds(winIdRef.current);
        }
        setIsAnimatingBounds(false);
      }
    });

    return () => {
      cancelled = true;
      for (const control of controls) {
        control.stop();
      }
    };
  }, [
    win.x,
    win.y,
    win.width,
    win.height,
    win.isMaximized,
    win.preMaximizeBounds,
    isRestoring,
    isDragging,
    isResizing,
    isViewportSync,
    effectiveDockArea,
    boundsLeft,
    boundsTop,
    boundsWidth,
    boundsHeight,
    boundsRadius,
  ]);

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
      if (isResizing || isAnimatingBounds) return;
      if ((e.target as Element).closest(".title-bar-controls")) return;

      if (win.isMaximized) {
        focusWindow(win.id);
        return;
      }

      e.preventDefault();
      focusWindow(win.id);
      setIsDragging(true);
      dragSizeRef.current = { width: win.width, height: win.height };
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        winX: win.x,
        winY: win.y,
      };

      const onPointerMove = (ev: PointerEvent) => {
        const dx = ev.clientX - dragStart.current.x;
        const dy = ev.clientY - dragStart.current.y;
        const { width, height } = dragSizeRef.current;
        const maxX = globalThis.innerWidth - width;
        const maxY = globalThis.innerHeight - height - effectiveDockArea;
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
    [
      win.isMaximized,
      isAnimatingBounds,
      isResizing,
      focusWindow,
      win.x,
      win.y,
      win.width,
      win.height,
      win.id,
      updateWindow,
      flushDrag,
      effectiveDockArea,
    ]
  );

  const handleToggleMaximize = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleMaximizeWindow(win.id);
    },
    [toggleMaximizeWindow, win.id]
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
      } ${isDragging ? "window-dragging" : ""} ${
        win.isMaximized ? "window-maximized" : ""
      }`}
      style={{
        left: boundsLeft,
        top: boundsTop,
        width: boundsWidth,
        height: boundsHeight,
        borderRadius: boundsRadius,
        zIndex: win.zIndex,
        transformOrigin,
      }}
      initial={
        hasEntered
          ? false
          : shouldGenie && genieOrigin
            ? variants.initial
            : { opacity: 0, scale: 0.92 }
      }
      animate={
        shouldGenie && genieOrigin
          ? variants.animate
          : { opacity: 1, scale: 1 }
      }
      exit={variants.exit}
      transition={
        shouldGenie
          ? {
              type: "spring",
              stiffness: 340,
              damping: 26,
              mass: 0.75,
            }
          : { duration: 0.25 }
      }
      onPointerDown={() => focusWindow(win.id)}
      layout={false}
    >
      <div
        className="title-bar relative flex h-9 shrink-0 cursor-default select-none items-center gap-2 px-3"
        onPointerDown={handleDragStart}
      >
        <div
          className="title-bar-controls pointer-events-auto absolute left-3 top-1/2 z-30 flex -translate-y-1/2 items-center gap-1.5"
          onPointerDown={(e) => e.stopPropagation()}
        >
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
            onClick={handleToggleMaximize}
            className={`traffic-light traffic-maximize ${
              win.isMaximized ? "traffic-maximize-active" : ""
            }`}
            aria-label={win.isMaximized ? "Restore" : "Maximize"}
            aria-pressed={win.isMaximized}
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
        disabled={win.isMaximized || isAnimatingBounds || isRestoring || config?.resizable === false}
        dockArea={effectiveDockArea}
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
