"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Wallpaper } from "./Wallpaper";
import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";
import { WindowManager } from "@/components/window/Window";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { useWindowStore } from "@/store/windowStore";

export function Desktop() {
  const desktopRef = useRef<HTMLDivElement>(null);
  const [showLoader, setShowLoader] = useState(true);
  const theme = useWindowStore((s) => s.theme);
  const activeWindowId = useWindowStore((s) => s.activeWindowId);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const windows = useWindowStore((s) => s.windows);
  const openApp = useWindowStore((s) => s.openApp);

  const handleBootComplete = useCallback(() => {
    setShowLoader(false);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (showLoader) return;
    const timer = setTimeout(() => openApp("home"), 350);
    return () => clearTimeout(timer);
  }, [showLoader, openApp]);

  useEffect(() => {
    if (showLoader) return;

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
  }, [showLoader, activeWindowId, closeWindow, windows]);

  return (
    <>
      <div
        ref={desktopRef}
        className="desktop relative h-screen w-screen overflow-hidden"
        style={{
          opacity: 0,
          transform: "scale(0.68)",
          filter: "blur(20px)",
          transformOrigin: "center center",
        }}
      >
        <Wallpaper />
        <MenuBar />
        <WindowManager />
        <Dock />
      </div>
      {showLoader && (
        <LoadingScreen
          desktopRef={desktopRef}
          onComplete={handleBootComplete}
        />
      )}
    </>
  );
}
