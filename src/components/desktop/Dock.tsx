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
