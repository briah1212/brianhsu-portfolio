"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import { getAppConfig } from "@/config/apps";
import { AppContainer } from "@/components/apps/AppContainer";
import type { WindowState } from "@/types";

const MIN_WIDTH = 320;
const MIN_HEIGHT = 240;
const MENU_BAR_HEIGHT = 28;
const DOCK_AREA = 90;

interface WindowProps { window: WindowState; }

export function Window({ window: win }: WindowProps) {
  const { focusWindow, closeWindow, minimizeWindow, updateWindow, activeWindowId, genieOrigin, genieAppId, clearGenieOrigin, theme } = useWindowStore();
  const isActive = activeWindowId === win.id;
  const config = getAppConfig(win.appId);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, winX: 0, winY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const shouldGenie = genieAppId === win.appId && genieOrigin !== null;

  useEffect(() => {
    if (shouldGenie) { const t = setTimeout(clearGenieOrigin, 600); return () => clearTimeout(t); }
  }, [shouldGenie, clearGenieOrigin]);

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    if (win.isMaximized) return;
    e.preventDefault(); focusWindow(win.id); setIsDragging(true);
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

  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation(); focusWindow(win.id); setIsResizing(true);
    resizeStart.current = { x: e.clientX, y: e.clientY, width: win.width, height: win.height };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [win.id, win.width, win.height, focusWindow]);

  const handleResizeMove = useCallback((e: React.PointerEvent) => {
    if (!isResizing) return;
    updateWindow(win.id, {
      width: Math.max(MIN_WIDTH, resizeStart.current.width + e.clientX - resizeStart.current.x),
      height: Math.max(MIN_HEIGHT, resizeStart.current.height + e.clientY - resizeStart.current.y),
    });
  }, [isResizing, win.id, updateWindow]);

  if (win.isMinimized) return null;

  return (
    <motion.div
      className={`window absolute flex flex-col overflow-hidden ${theme === "dark" ? "window-dark" : "window-light"} ${isActive ? "window-active" : "window-inactive"}`}
      style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex }}
      onPointerDown={() => focusWindow(win.id)}
    >
      <div className="title-bar flex h-9 shrink-0 items-center gap-2 px-3"
        onPointerDown={handleDragStart} onPointerMove={handleDragMove} onPointerUp={() => setIsDragging(false)} onPointerCancel={() => setIsDragging(false)}>
        <div className="flex items-center gap-1.5">
          <button onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} className="traffic-light traffic-close" aria-label="Close" />
          <button onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }} className="traffic-light traffic-minimize" aria-label="Minimize" />
          <button className="traffic-light traffic-maximize opacity-50 cursor-default" disabled aria-label="Maximize" />
        </div>
        <span className="flex-1 text-center text-xs font-medium truncate text-foreground/70">{config?.title ?? win.title}</span>
        <div className="w-[52px]" />
      </div>
      <div className="flex-1 overflow-hidden"><AppContainer appId={win.appId} windowId={win.id} route={win.route} /></div>
      <div className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
        onPointerDown={handleResizeStart} onPointerMove={handleResizeMove}
        onPointerUp={() => setIsResizing(false)} onPointerCancel={() => setIsResizing(false)} />
    </motion.div>
  );
}

export function WindowManager() {
  const windows = useWindowStore((s) => s.windows);
  return (<AnimatePresence>{windows.map((win) => <Window key={win.id} window={win} />)}</AnimatePresence>);
}
