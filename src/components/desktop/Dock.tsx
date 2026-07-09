"use client";

import { Fragment, memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { APPS } from "@/config/apps";
import { isSvgAsset } from "@/config/assets";
import { useWindowStore } from "@/store/windowStore";
import type { AppConfig, AppId } from "@/types";

const ICON_SIZE = 52;
const ICON_GAP = 12;
const DOCK_PADDING_X = 16;
const DOCK_PADDING_TOP = 8;
const DOCK_PADDING_BOTTOM = 14;
const ICON_AREA_HEIGHT = 52;
const DOCK_HEIGHT = DOCK_PADDING_TOP + ICON_AREA_HEIGHT + DOCK_PADDING_BOTTOM;
const DOCK_BOTTOM_OFFSET = 12;
const MAX_SCALE = 1.7;
const MAGNIFICATION_OVERFLOW = ICON_SIZE * (MAX_SCALE - 1);
const HIDE_OFFSET =
  DOCK_BOTTOM_OFFSET + DOCK_HEIGHT + MAGNIFICATION_OVERFLOW + 8;
const HIDE_DELAY_MS = 600;

function getRevealProximityPx(): number {
  return globalThis.innerHeight / 10;
}
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
      className={`dock-tooltip pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-[7px] px-3 py-1.5 text-xs font-medium ${
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
  const svgIcon = isSvgAsset(app.icon);

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
        className={`dock-icon relative flex shrink-0 items-center justify-center rounded-[14px] ${
          svgIcon ? "dock-icon-svg" : ""
        }`}
        style={
          svgIcon
            ? {
                width: ICON_SIZE,
                height: ICON_SIZE,
                scale: smoothScale,
                originY: 1,
                originX: 0.5,
              }
            : {
                width: ICON_SIZE,
                height: ICON_SIZE,
                scale: smoothScale,
                originY: 1,
                originX: 0.5,
                background: `linear-gradient(180deg, ${topColor} 0%, ${app.color} 100%)`,
                boxShadow:
                  "0 2px 6px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.35)",
                border: "1px solid rgba(255,255,255,0.18)",
              }
        }
        aria-label={`Open ${app.title}`}
      >
        {svgIcon ? (
          <img
            src={app.icon}
            alt=""
            className="dock-icon-image"
            draggable={false}
          />
        ) : (
          <span className="select-none text-[22px] leading-none drop-shadow-sm">
            {app.icon}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.span
            className="dock-open-indicator"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export function Dock() {
  const dockRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const rafRef = useRef<number | null>(null);
  const pendingX = useRef<number | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dockPointerDownRef = useRef(false);
  const lastPointerYRef = useRef<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  const openApp = useWindowStore((s) => s.openApp);
  const setDockPosition = useWindowStore((s) => s.setDockPosition);
  const windows = useWindowStore((s) => s.windows);
  const theme = useWindowStore((s) => s.theme);
  const dockVisible = useWindowStore((s) => s.dockVisible);
  const setDockVisible = useWindowStore((s) => s.setDockVisible);

  const hasMaximizedWindow = windows.some(
    (w) => w.isMaximized && !w.isMinimized
  );

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current !== null) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const showDock = useCallback(() => {
    clearHideTimeout();
    setDockVisible(true);
  }, [clearHideTimeout, setDockVisible]);

  const isInRevealProximity = useCallback((clientY: number) => {
    return globalThis.innerHeight - clientY <= getRevealProximityPx();
  }, []);

  const scheduleHide = useCallback(() => {
    if (!hasMaximizedWindow) return;
    if (dockPointerDownRef.current) return;
    const y = lastPointerYRef.current;
    if (y !== null && isInRevealProximity(y)) return;
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      hideTimeoutRef.current = null;
      const latestY = lastPointerYRef.current;
      if (latestY !== null && isInRevealProximity(latestY)) return;
      if (!dockPointerDownRef.current) {
        setDockVisible(false);
      }
    }, HIDE_DELAY_MS);
  }, [
    hasMaximizedWindow,
    clearHideTimeout,
    setDockVisible,
    isInRevealProximity,
  ]);

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

  const handleDockEnter = useCallback(() => {
    showDock();
  }, [showDock]);

  const handleDockLeave = useCallback(() => {
    handleMouseLeave();
    scheduleHide();
  }, [handleMouseLeave, scheduleHide]);

  const handleDockPointerDown = useCallback(() => {
    dockPointerDownRef.current = true;
    clearHideTimeout();
  }, [clearHideTimeout]);

  const handleDockPointerUp = useCallback(() => {
    dockPointerDownRef.current = false;
  }, []);

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

  useEffect(() => {
    return () => clearHideTimeout();
  }, [clearHideTimeout]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!hasMaximizedWindow && !dockVisible) {
      setDockVisible(true);
    }
  }, [hasMaximizedWindow, dockVisible, setDockVisible]);

  useEffect(() => {
    if (!hasMaximizedWindow) return;

    const handlePointerMove = (e: PointerEvent) => {
      lastPointerYRef.current = e.clientY;
      if (isInRevealProximity(e.clientY)) {
        showDock();
      }
    };

    globalThis.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    return () =>
      globalThis.removeEventListener("pointermove", handlePointerMove);
  }, [hasMaximizedWindow, isInRevealProximity, showDock]);

  const revealZoneActive = hasMaximizedWindow;
  const showRevealHint = revealZoneActive && !dockVisible;
  const revealZoneHeight = getRevealProximityPx();

  return (
    <>
      {revealZoneActive && (
        <div
          className="dock-reveal-zone"
          style={{ height: revealZoneHeight }}
          onMouseEnter={showDock}
          onPointerMove={showDock}
          aria-hidden
        />
      )}
      {showRevealHint && (
        <div className="dock-reveal-hint" aria-hidden>
          <span className="dock-reveal-hint-pill" />
        </div>
      )}
      <motion.div
        className={`fixed bottom-3 left-0 right-0 z-[9998] flex justify-center overflow-visible ${
          dockVisible ? "pointer-events-auto" : "pointer-events-none"
        }`}
        animate={{ y: dockVisible ? 0 : HIDE_OFFSET }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 380, damping: 32, mass: 0.8 }
        }
        onMouseEnter={handleDockEnter}
        onMouseLeave={handleDockLeave}
        onPointerDown={handleDockPointerDown}
        onPointerUp={handleDockPointerUp}
        onPointerCancel={handleDockPointerUp}
      >
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
      >
        {APPS.map((app, index) => (
          <Fragment key={app.id}>
            {/* Separator between primary apps and desk accessories */}
            {app.id === "calculator" && (
              <div
                className="dock-separator"
                style={{
                  width: '1px',
                  height: '48px',
                  marginLeft: '4px',
                  marginRight: '4px',
                  alignSelf: 'center',
                }}
              />
            )}
            <DockIcon
              app={app}
              index={index}
              mouseX={mouseX}
              isOpen={isAppOpen(app.id)}
              theme={theme}
              onOpen={handleOpen}
            />
          </Fragment>
        ))}
      </motion.div>
      </motion.div>
    </>
  );
}
