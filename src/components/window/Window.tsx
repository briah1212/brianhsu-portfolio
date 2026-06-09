"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import { getAppConfig } from "@/config/apps";
import { AppContainer } from "@/components/apps/AppContainer";
import type { WindowState } from "@/types";

const MENU_BAR_HEIGHT = 28;
const DOCK_AREA = 90;

interface WindowProps {
  window: WindowState;
}

export function Window({ window: win }: WindowProps) {
  const { focusWindow, closeWindow, minimizeWindow, updateWindow, activeWindowId, genieOrigin, genieAppId, clearGenieOrigin, theme } = useWindowStore();
  const isActive = activeWindowId === win.id;
  const config = getAppConfig(win.appId);
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, winX: 0, winY: 0 });
  const shouldGenie = genieAppId === win.appId && genieOrigin !== null;

  useEffect(() => {
    if (shouldGenie) {
      const timer = setTimeout(clearGenieOrigin, 600);
      return () => clearTimeout(timer);
    }
  }, [shouldGenie, clearGenieOrigin]);

  const getGenieVariants = () => {
    if (!shouldGenie || !genieOrigin) {
      return { initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.88, transition: { duration: 0.2 } } };
    }
    return {
      initial: { opacity: 0.5, scaleX: 0.06, scaleY: 0.03, borderRadius: 24 },
      animate: { opacity: 1, scaleX: 1, scaleY: 1, borderRadius: 12, transition: { type: "spring" as const, stiffness: 340, damping: 26, mass: 0.75 } },
      exit: { opacity: 0, scaleX: 0.08, scaleY: 0.04, transition: { duration: 0.22, ease: "easeIn" as const } },
    };
  };

  const transformOrigin = shouldGenie && genieOrigin ? `${genieOrigin.x - win.x}px ${genieOrigin.y - win.y}px` : "center center";

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    if (win.isMaximized) return;
    e.preventDefault();
    focusWindow(win.id);
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, winX: win.x, winY: win.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [win.id, win.x, win.y, win.isMaximized, focusWindow]);

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    updateWindow(win.id, {
      x: Math.max(0, Math.min(globalThis.innerWidth - win.width, dragStart.current.winX + dx)),
      y: Math.max(MENU_BAR_HEIGHT, Math.min(globalThis.innerHeight - win.height - DOCK_AREA, dragStart.current.winY + dy)),
    });
  }, [isDragging, win.id, win.width, win.height, updateWindow]);

  const handleDragEnd = useCallback(() => setIsDragging(false), []);

  if (win.isMinimized) return null;
  const variants = getGenieVariants();

  return (
    <motion.div
      ref={windowRef}
      className={`window absolute flex flex-col overflow-hidden ${theme === "dark" ? "window-dark" : "window-light"} ${isActive ? "window-active" : "window-inactive"}`}
      style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex, transformOrigin }}
      initial={variants.initial} animate={variants.animate} exit={variants.exit}
      onPointerDown={() => focusWindow(win.id)} layout={false}
    >
      <div className="title-bar flex h-9 shrink-0 items-center gap-2 px-3 cursor-default select-none"
        onPointerDown={handleDragStart} onPointerMove={handleDragMove} onPointerUp={handleDragEnd} onPointerCancel={handleDragEnd}>
        <div className="flex items-center gap-1.5">
          <button onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} className="traffic-light traffic-close" aria-label="Close" />
          <button onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }} className="traffic-light traffic-minimize" aria-label="Minimize" />
          <button className="traffic-light traffic-maximize opacity-50 cursor-default" aria-label="Maximize" disabled />
        </div>
        <span className="flex-1 text-center text-xs font-medium truncate text-foreground/70">{win.route ? win.title : config?.title ?? win.title}</span>
        <div className="w-[52px]" />
      </div>
      <div className="flex-1 overflow-hidden">
        <AppContainer appId={win.appId} windowId={win.id} route={win.route} />
      </div>
    </motion.div>
  );
}

export function WindowManager() {
  const windows = useWindowStore((s) => s.windows);
  return (<AnimatePresence>{windows.map((win) => <Window key={win.id} window={win} />)}</AnimatePresence>);
}
