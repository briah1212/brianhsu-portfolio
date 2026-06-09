"use client";

import { memo, useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { APPS } from "@/config/apps";
import { useWindowStore } from "@/store/windowStore";
import type { AppConfig, AppId } from "@/types";

const ICON_SIZE = 52;
const ICON_GAP = 12;
const DOCK_PADDING_X = 16;
const DOCK_PADDING_TOP = 8;
const DOCK_PADDING_BOTTOM = 14;
const ICON_AREA_HEIGHT = 52;
const DOCK_HEIGHT = DOCK_PADDING_TOP + ICON_AREA_HEIGHT + DOCK_PADDING_BOTTOM;
const MAX_SCALE = 1.7;
const SIGMA = 50;

const SPRING = { stiffness: 380, damping: 30, mass: 0.4 };

function gaussianScale(mouseX: number, iconCenterX: number): number {
  const distance = mouseX - iconCenterX;
  const falloff = Math.exp(-(distance * distance) / (2 * SIGMA * SIGMA));
  return 1 + (MAX_SCALE - 1) * falloff;
}

/** Rest-position center used for scale calculation */
function restCenterX(index: number): number {
  return (
    DOCK_PADDING_X +
    index * (ICON_SIZE + ICON_GAP) +
    ICON_SIZE / 2
  );
}

function lightenColor(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 0xff) + amount);
  const g = Math.min(255, ((n >> 8) & 0xff) + amount);
  const b = Math.min(255, (n & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

interface DockTooltipProps {
  title: string;
  theme: "light" | "dark";
  opacity: MotionValue<number>;
  y: MotionValue<number>;
  visible: boolean;
}

function DockTooltip({ title, theme, opacity, y, visible }: DockTooltipProps) {
  return (
    <motion.div
      className={`dock-tooltip pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-[6px] px-2.5 py-1 text-[11px] font-medium ${
        theme === "dark"
          ? "bg-neutral-700/95 text-white"
          : "bg-white text-neutral-800"
      }`}
      style={{
        opacity,
        y,
        bottom: "calc(100% + 18px)",
        visibility: visible ? "visible" : "hidden",
      }}
      aria-hidden={!visible}
    >
      {title}
      <span
        className={`dock-tooltip-arrow absolute left-1/2 top-full -translate-x-1/2 ${
          theme === "dark" ? "border-t-neutral-700/95" : "border-t-white"
        }`}
      />
    </motion.div>
  );
}

interface DockIconProps {
  app: AppConfig;
  index: number;
  mouseX: MotionValue<number>;
  isOpen: boolean;
  theme: "light" | "dark";
  onOpen: (appId: AppId, el: HTMLButtonElement) => void;
}

const DockIcon = memo(function DockIcon({
  app,
  index,
  mouseX,
  isOpen,
  theme,
  onOpen,
}: DockIconProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const center = restCenterX(index);
  const [showTooltip, setShowTooltip] = useState(false);

  const scale = useTransform(mouseX, (x) => {
    if (!Number.isFinite(x)) return 1;
    return gaussianScale(x, center);
  });

  const smoothScale = useSpring(scale, SPRING);

  /** Slot grows horizontally to fit magnified icon — drives dock width expansion */
  const slotWidth = useSpring(
    useTransform(smoothScale, (s) => ICON_SIZE * s),
    SPRING
  );

  const tooltipOpacity = useTransform(smoothScale, (s) =>
    s > 1.06 ? Math.min(1, (s - 1.06) / 0.2) : 0
  );

  const tooltipY = useTransform(smoothScale, (s) =>
    s > 1.06 ? -4 - (s - 1) * 8 : 6
  );

  useMotionValueEvent(smoothScale, "change", (s) => {
    setShowTooltip(s > 1.08);
  });

  const topColor = lightenColor(app.color, 28);

  return (
    <motion.div
      className="dock-icon-slot"
      style={{ width: slotWidth, height: ICON_AREA_HEIGHT }}
    >
      <DockTooltip
        title={app.title}
        theme={theme}
        opacity={tooltipOpacity}
        y={tooltipY}
        visible={showTooltip}
      />

      <motion.button
        ref={buttonRef}
        onClick={() => buttonRef.current && onOpen(app.id, buttonRef.current)}
        className="dock-icon relative flex shrink-0 items-center justify-center rounded-[14px]"
        style={{
          width: ICON_SIZE,
          height: ICON_SIZE,
          scale: smoothScale,
          originY: 1,
          originX: 0.5,
          background: `linear-gradient(180deg, ${topColor} 0%, ${app.color} 100%)`,
          boxShadow:
            "0 2px 6px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.35)",
          border: "1px solid rgba(255,255,255,0.18)",
        }}
        aria-label={`Open ${app.title}`}
      >
        <span className="select-none text-[22px] leading-none drop-shadow-sm">
          {app.icon}
        </span>
      </motion.button>

      {isOpen && (
        <span className="dock-open-indicator absolute bottom-0 left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-white/85" />
      )}
    </motion.div>
  );
});

export function Dock() {
  const dockRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const rafRef = useRef<number | null>(null);
  const pendingX = useRef<number | null>(null);

  const openApp = useWindowStore((s) => s.openApp);
  const setDockPosition = useWindowStore((s) => s.setDockPosition);
  const windows = useWindowStore((s) => s.windows);
  const theme = useWindowStore((s) => s.theme);

  const flushMouseX = useCallback(() => {
    rafRef.current = null;
    if (pendingX.current !== null) {
      mouseX.set(pendingX.current);
    }
  }, [mouseX]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = dockRef.current?.getBoundingClientRect();
      if (!rect) return;
      pendingX.current = e.clientX - rect.left;
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(flushMouseX);
      }
    },
    [flushMouseX]
  );

  const handleMouseLeave = useCallback(() => {
    pendingX.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    mouseX.set(Number.POSITIVE_INFINITY);
  }, [mouseX]);

  const handleOpen = useCallback(
    (appId: AppId, el: HTMLButtonElement) => {
      const rect = el.getBoundingClientRect();
      setDockPosition(
        appId,
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
      openApp(appId);
    },
    [openApp, setDockPosition]
  );

  const isAppOpen = useCallback(
    (appId: AppId) =>
      windows.some((w) => w.appId === appId && !w.isMinimized),
    [windows]
  );

  useLayoutEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-3 left-0 right-0 z-[9998] flex justify-center overflow-visible">
      <motion.div
        ref={dockRef}
        layout
        transition={SPRING}
        className={`dock pointer-events-auto flex items-end rounded-[18px] ${
          theme === "dark" ? "dock-dark" : "dock-light"
        }`}
        style={{
          height: DOCK_HEIGHT,
          paddingTop: DOCK_PADDING_TOP,
          paddingBottom: DOCK_PADDING_BOTTOM,
          paddingLeft: DOCK_PADDING_X,
          paddingRight: DOCK_PADDING_X,
          gap: ICON_GAP,
          overflow: "visible",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {APPS.map((app, index) => (
          <DockIcon
            key={app.id}
            app={app}
            index={index}
            mouseX={mouseX}
            isOpen={isAppOpen(app.id)}
            theme={theme}
            onOpen={handleOpen}
          />
        ))}
      </motion.div>
    </div>
  );
}
