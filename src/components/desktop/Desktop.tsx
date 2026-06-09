"use client";

import { useEffect, useState } from "react";
import { Wallpaper } from "./Wallpaper";
import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";
import { WindowManager } from "@/components/window/Window";
import { useWindowStore } from "@/store/windowStore";

export function Desktop() {
  const [mounted, setMounted] = useState(false);
  const theme = useWindowStore((s) => s.theme);
  const activeWindowId = useWindowStore((s) => s.activeWindowId);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const windows = useWindowStore((s) => s.windows);
  const openApp = useWindowStore((s) => s.openApp);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Open Home on first visit
  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => openApp("home"), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "w") {
        e.preventDefault();
        if (activeWindowId) closeWindow(activeWindowId);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "m") {
        e.preventDefault();
        if (activeWindowId) {
          useWindowStore.getState().minimizeWindow(activeWindowId);
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key >= "1" && e.key <= "5") {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        const visible = windows.filter((w) => !w.isMinimized);
        if (visible[index]) {
          useWindowStore.getState().focusWindow(visible[index].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeWindowId, closeWindow, windows]);

  if (!mounted) {
    return (
      <div className="desktop relative h-screen w-screen overflow-hidden">
        <Wallpaper />
      </div>
    );
  }

  return (
    <div className="desktop relative h-screen w-screen overflow-hidden">
      <Wallpaper />
      <MenuBar />
      <WindowManager />
      <Dock />
    </div>
  );
}
