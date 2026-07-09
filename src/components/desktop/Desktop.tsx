"use client";

import { useCallback, useEffect, useState } from "react";
import { Wallpaper } from "./Wallpaper";
import { DesktopFolders } from "./DesktopFolders";
import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";
import { WindowManager } from "@/components/window/Window";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { ClickSpark } from "@/components/effects/ClickSpark";
import { useWindowStore } from "@/store/windowStore";

export function Desktop() {
  const [showLoading, setShowLoading] = useState(true);
  const [desktopReady, setDesktopReady] = useState(false);
  const theme = useWindowStore((s) => s.theme);
  const hydrateTheme = useWindowStore((s) => s.hydrateTheme);
  const hydrateFolderPositions = useWindowStore((s) => s.hydrateFolderPositions);
  const hydrateDesktopIconPositions = useWindowStore(
    (s) => s.hydrateDesktopIconPositions
  );
  const activeWindowId = useWindowStore((s) => s.activeWindowId);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const windows = useWindowStore((s) => s.windows);
  const openApp = useWindowStore((s) => s.openApp);

  const handleRevealDesktop = useCallback(() => {
    setDesktopReady(true);
  }, []);

  const handleLoadingExit = useCallback(() => {
    setShowLoading(false);
    // Dispatch event that loading is complete for chatbot
    window.dispatchEvent(new CustomEvent('desktopLoaded'));
  }, []);

  useEffect(() => {
    hydrateTheme();
    hydrateFolderPositions();
    hydrateDesktopIconPositions();
  }, [hydrateTheme, hydrateFolderPositions, hydrateDesktopIconPositions]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!desktopReady) return;
    const timer = setTimeout(() => {
      openApp("home");
      openApp("about");
    }, 300);
    return () => clearTimeout(timer);
  }, [desktopReady, openApp]);

  useEffect(() => {
    if (!desktopReady) return;

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
  }, [desktopReady, activeWindowId, closeWindow, windows]);

  return (
    <>
      {desktopReady && (
        <div className="desktop relative h-screen w-screen overflow-hidden">
          <ClickSpark
            sparkColor={theme === "dark" ? "#7dd3fc" : "#0284c7"}
            sparkSize={10}
            sparkRadius={18}
            sparkCount={8}
            duration={420}
          >
            <Wallpaper />
            <DesktopFolders />
            <MenuBar />
            <WindowManager />
            <Dock />
          </ClickSpark>
        </div>
      )}
      {showLoading && (
        <LoadingScreen
          onRevealDesktop={handleRevealDesktop}
          onExitComplete={handleLoadingExit}
        />
      )}
    </>
  );
}
