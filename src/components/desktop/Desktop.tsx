"use client";

import { useCallback, useEffect, useState } from "react";
import { Wallpaper } from "./Wallpaper";
import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";
import { WindowManager } from "@/components/window/Window";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { useWindowStore } from "@/store/windowStore";

export function Desktop() {
  const [isBooting, setIsBooting] = useState(true);
  const theme = useWindowStore((s) => s.theme);
  const activeWindowId = useWindowStore((s) => s.activeWindowId);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const windows = useWindowStore((s) => s.windows);
  const openApp = useWindowStore((s) => s.openApp);

  const handleBootComplete = useCallback(() => {
    setIsBooting(false);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (isBooting) return;
    const timer = setTimeout(() => openApp("home"), 400);
    return () => clearTimeout(timer);
  }, [isBooting, openApp]);

  useEffect(() => {
    if (isBooting) return;

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
  }, [isBooting, activeWindowId, closeWindow, windows]);

  if (isBooting) {
    return <LoadingScreen onComplete={handleBootComplete} />;
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
