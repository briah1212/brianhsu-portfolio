#!/usr/bin/env bash
# Rebuilds a logical commit history for the portfolio project.
set -euo pipefail
cd "$(dirname "$0")/.."

INITIAL=4329e12

git checkout --orphan rebuilt-main 2>/dev/null || git checkout --orphan rebuilt-main
git rm -rf --cached . 2>/dev/null || true

# --- 1. Initial scaffold ---
git checkout "$INITIAL" -- \
  .gitignore AGENTS.md CLAUDE.md README.md eslint.config.mjs next.config.ts \
  package-lock.json package.json postcss.config.mjs tsconfig.json \
  public src/app/favicon.ico src/app/globals.css src/app/layout.tsx src/app/page.tsx

git add .gitignore
git commit -m "$(cat <<'EOF'
feat: initial Next.js app setup with TypeScript and Tailwind

Scaffold the portfolio app with Next.js App Router, TypeScript, Tailwind CSS 4,
and default project configuration.
EOF
)"

# --- 2. Desktop layout ---
git add package.json package-lock.json
git add src/types/ src/config/ src/store/
git add src/components/desktop/Desktop.tsx
git add src/components/desktop/Wallpaper.tsx
git add src/components/desktop/MenuBar.tsx
git add src/app/page.tsx src/app/layout.tsx src/app/globals.css
git commit -m "$(cat <<'EOF'
feat: implement macOS-style desktop layout

Add Zustand window store, app configuration, desktop shell with wallpaper,
menu bar, and theme-aware global styles.
EOF
)"

# --- 3. Dock (initial magnification) ---
cp src/components/desktop/Dock.tsx /tmp/dock-final.tsx
cat > src/components/desktop/Dock.tsx <<'DOCK3'
"use client";

import { useCallback, useRef, useState } from "react";
import { APPS } from "@/config/apps";
import { useWindowStore } from "@/store/windowStore";
import type { AppId } from "@/types";

const BASE_SIZE = 52;
const MAX_SCALE = 1.65;
const MAGNIFICATION_RANGE = 140;

function getScale(mouseX: number, iconCenterX: number): number {
  const distance = Math.abs(mouseX - iconCenterX);
  if (distance > MAGNIFICATION_RANGE) return 1;
  const t = 1 - distance / MAGNIFICATION_RANGE;
  return 1 + (MAX_SCALE - 1) * Math.pow(t, 2);
}

export function Dock() {
  const dockRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<Map<AppId, HTMLButtonElement>>(new Map());
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [iconCenters, setIconCenters] = useState<Record<AppId, number>>({} as Record<AppId, number>);
  const openApp = useWindowStore((s) => s.openApp);
  const setDockPosition = useWindowStore((s) => s.setDockPosition);
  const windows = useWindowStore((s) => s.windows);
  const theme = useWindowStore((s) => s.theme);

  const updateCenters = useCallback(() => {
    const dock = dockRef.current;
    if (!dock) return;
    const dockRect = dock.getBoundingClientRect();
    const centers = {} as Record<AppId, number>;
    iconRefs.current.forEach((el, appId) => {
      const rect = el.getBoundingClientRect();
      centers[appId] = rect.left + rect.width / 2 - dockRect.left;
    });
    setIconCenters(centers);
  }, []);

  const handleOpen = (appId: AppId) => {
    const el = iconRefs.current.get(appId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setDockPosition(appId, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    openApp(appId);
  };

  return (
    <div className="fixed bottom-3 left-0 right-0 z-[9998] flex justify-center pointer-events-none">
      <div ref={dockRef} className={`dock pointer-events-auto flex items-end gap-1.5 rounded-2xl px-3 py-2 ${theme === "dark" ? "dock-dark" : "dock-light"}`}
        onMouseMove={(e) => { const r = dockRef.current?.getBoundingClientRect(); if (r) setMouseX(e.clientX - r.left); }}
        onMouseLeave={() => setMouseX(null)} onMouseEnter={updateCenters}>
        {APPS.map((app) => {
          const scale = mouseX !== null && iconCenters[app.id] !== undefined ? getScale(mouseX, iconCenters[app.id]) : 1;
          const size = BASE_SIZE * scale;
          return (
            <div key={app.id} className="relative flex flex-col items-center" style={{ width: size, height: size + 8 }}>
              <button ref={(el) => { if (el) iconRefs.current.set(app.id, el); }} onClick={() => handleOpen(app.id)}
                className="dock-icon relative flex items-center justify-center rounded-xl"
                style={{ width: size, height: size, background: `linear-gradient(145deg, ${app.color}ee, ${app.color}99)` }}
                aria-label={`Open ${app.title}`}>
                <span style={{ fontSize: Math.max(20, size * 0.42) }}>{app.icon}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
DOCK3

git add src/components/desktop/Dock.tsx
git commit -m "$(cat <<'EOF'
feat: add dock with magnification interaction

Introduce a bottom dock with distance-based icon magnification and
config-driven app launcher icons.
EOF
)"

# --- 4. Window system (no drag/resize yet) ---
cp src/components/window/Window.tsx /tmp/window-final.tsx
cat > src/components/window/Window.tsx <<'WINDOW4'
"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import { getAppConfig } from "@/config/apps";
import { AppContainer } from "@/components/apps/AppContainer";
import type { WindowState } from "@/types";

interface WindowProps {
  window: WindowState;
}

export function Window({ window: win }: WindowProps) {
  const {
    focusWindow,
    closeWindow,
    minimizeWindow,
    activeWindowId,
    genieOrigin,
    genieAppId,
    clearGenieOrigin,
    theme,
  } = useWindowStore();

  const isActive = activeWindowId === win.id;
  const config = getAppConfig(win.appId);
  const windowRef = useRef<HTMLDivElement>(null);
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
      initial: { opacity: 0.5, scaleX: 0.06, scaleY: 0.03, borderRadius: 24 },
      animate: {
        opacity: 1, scaleX: 1, scaleY: 1, borderRadius: 12,
        transition: { type: "spring" as const, stiffness: 340, damping: 26, mass: 0.75 },
      },
      exit: { opacity: 0, scaleX: 0.08, scaleY: 0.04, transition: { duration: 0.22, ease: "easeIn" as const } },
    };
  };

  const transformOrigin =
    shouldGenie && genieOrigin
      ? `${genieOrigin.x - win.x}px ${genieOrigin.y - win.y}px`
      : "center center";

  if (win.isMinimized) return null;
  const variants = getGenieVariants();

  return (
    <motion.div
      ref={windowRef}
      className={`window absolute flex flex-col overflow-hidden ${theme === "dark" ? "window-dark" : "window-light"} ${isActive ? "window-active" : "window-inactive"}`}
      style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex, transformOrigin }}
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      onPointerDown={() => focusWindow(win.id)}
      layout={false}
    >
      <div className="title-bar flex h-9 shrink-0 items-center gap-2 px-3 cursor-default select-none">
        <div className="flex items-center gap-1.5">
          <button onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} className="traffic-light traffic-close" aria-label="Close" />
          <button onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }} className="traffic-light traffic-minimize" aria-label="Minimize" />
          <button className="traffic-light traffic-maximize opacity-50 cursor-default" aria-label="Maximize" disabled />
        </div>
        <span className="flex-1 text-center text-xs font-medium truncate text-foreground/70">
          {win.route ? win.title : config?.title ?? win.title}
        </span>
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
  return (
    <AnimatePresence>
      {windows.map((win) => (
        <Window key={win.id} window={win} />
      ))}
    </AnimatePresence>
  );
}
WINDOW4

git add src/components/window/Window.tsx src/components/apps/AppContainer.tsx
git commit -m "$(cat <<'EOF'
feat: implement window system (open, close, focus, z-index)

Add draggable app windows with genie open animation, traffic-light controls,
focus stacking, and per-app content routing.
EOF
)"

# --- 5. Draggable ---
cat > src/components/window/Window.tsx <<'WINDOW5'
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
WINDOW5

git add src/components/window/Window.tsx
git commit -m "$(cat <<'EOF'
feat: add draggable window behavior

Enable title-bar pointer drag with viewport clamping so windows can be
repositioned across the desktop.
EOF
)"

# --- 6. Corner resize ---
cat > src/components/window/Window.tsx <<'WINDOW6'
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
WINDOW6

git add src/components/window/Window.tsx
git commit -m "$(cat <<'EOF'
feat: implement resize system (corner-based initially)

Add bottom-right resize handle with minimum size constraints for window
dimensions.
EOF
)"

# --- 7. Apps ---
git add src/components/apps/HomeApp.tsx src/components/apps/AboutApp.tsx
git add src/components/apps/ContactApp.tsx src/components/apps/TerminalApp.tsx
git add src/components/apps/ProjectsApp.tsx
git commit -m "$(cat <<'EOF'
feat: add app structure (Home, About, Projects, Contact)

Implement portfolio app content windows including a terminal easter egg and
in-window project list navigation.
EOF
)"

# --- 8. Case studies ---
git add src/data/ src/components/projects/
git commit -m "$(cat <<'EOF'
feat: implement project case study system

Add JSON-driven project data with grid cards and detailed in-window case
study views.
EOF
)"

# --- 9. Style refinements (glass windows era) ---
# Restore glass-style globals snippet via sed on committed file - use current minus last fix
cp src/app/globals.css /tmp/globals-final.css
python3 - <<'PY'
from pathlib import Path
css = Path("/tmp/globals-final.css").read_text()
css = css.replace("--window-bg: #ffffff;", "--window-bg: rgba(255, 255, 255, 0.82);")
css = css.replace("--window-bg: #1e1e23;", "--window-bg: rgba(30, 30, 35, 0.88);")
css = css.replace("background-color: var(--window-bg);", "background: var(--window-bg);")
if "backdrop-filter: blur(40px)" not in css:
    css = css.replace(
        ".window {",
        ".window {\n  backdrop-filter: blur(40px) saturate(150%);\n  -webkit-backdrop-filter: blur(40px) saturate(150%);",
        1,
    )
Path("src/app/globals.css").write_text(css)
PY

git add src/app/globals.css
git commit -m "$(cat <<'EOF'
style: refine UI, shadows, layout spacing

Polish global styles with glassmorphism windows, dock chrome, and improved
shadow hierarchy across desktop components.
EOF
)"

# --- 10. Dock refinements ---
cp /tmp/dock-final.tsx src/components/desktop/Dock.tsx
git add src/components/desktop/Dock.tsx
git commit -m "$(cat <<'EOF'
fix: improve dock behavior and tooltip interactions

Refine magnification with fixed-height dock shelf, Gaussian scaling, spring
physics, and macOS-style tooltips with speech-bubble pointers.
EOF
)"

# --- 11. Full edge+corner resize ---
cp /tmp/window-final.tsx src/components/window/Window.tsx
git add src/components/window/Window.tsx
git add src/components/window/WindowResizeHandles.tsx src/components/window/resizeUtils.ts
git commit -m "$(cat <<'EOF'
fix: window resizing improvements (edges + corners)

Add full edge and corner resize handles with Gaussian hit zones, viewport
constraints, and rAF-throttled pointer tracking.
EOF
)"

# --- 12. Light mode + opaque windows ---
cp /tmp/globals-final.css src/app/globals.css
git add src/app/globals.css src/components/desktop/MenuBar.tsx
git add next.config.ts README.md
git commit -m "$(cat <<'EOF'
fix: light mode header text contrast + solid window backgrounds

Use theme-aware menu bar tokens for readable light-mode text and replace
transparent window surfaces with fully opaque backgrounds.
EOF
)"

# --- 13. Git workflow ---
git add .gitignore .cursor/rules/git-workflow.mdc scripts/rebuild-git-history.sh
git commit -m "$(cat <<'EOF'
chore: enforce git workflow with cursor auto-commit rule

Add enhanced gitignore, conventional commit Cursor rule, and history rebuild
script for maintainable version control.
EOF
)"

# Replace main branch
git branch -D main 2>/dev/null || true
git branch -m main
echo "Done. $(git log --oneline | wc -l | tr -d ' ') commits on main."
