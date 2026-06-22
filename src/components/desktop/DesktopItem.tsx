"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getEffectiveDockArea } from "@/components/window/resizeUtils";
import { clampFolderPosition } from "@/config/desktopLayout";
import { useWindowStore } from "@/store/windowStore";

const DRAG_THRESHOLD = 6;
const DRAG_SCALE = 1.08;
const ITEM_SPRING = { type: "spring" as const, stiffness: 420, damping: 28 };

interface DesktopItemProps {
  itemId: string;
  title: string;
  iconSrc: string;
  x: number;
  y: number;
  onActivate?: () => void;
  onPositionChange: (x: number, y: number) => void;
}

export function DesktopItem({
  itemId,
  title,
  iconSrc,
  x,
  y,
  onActivate,
  onPositionChange,
}: DesktopItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [livePos, setLivePos] = useState({ x, y });
  const livePosRef = useRef({ x, y });
  const dragStart = useRef({ pointerX: 0, pointerY: 0, x: 0, y: 0 });
  const didDragRef = useRef(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) {
      livePosRef.current = { x, y };
      setLivePos({ x, y });
    }
  }, [x, y, isDragging]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      itemRef.current?.setPointerCapture(e.pointerId);

      dragStart.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        x: livePosRef.current.x,
        y: livePosRef.current.y,
      };
      didDragRef.current = false;

      const onPointerMove = (ev: PointerEvent) => {
        const dx = ev.clientX - dragStart.current.pointerX;
        const dy = ev.clientY - dragStart.current.pointerY;

        if (!didDragRef.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) {
          return;
        }

        if (!didDragRef.current) {
          didDragRef.current = true;
          setIsDragging(true);
        }

        const dockArea = getEffectiveDockArea(
          useWindowStore.getState().dockVisible
        );
        const next = clampFolderPosition(
          dragStart.current.x + dx,
          dragStart.current.y + dy,
          globalThis.innerWidth,
          globalThis.innerHeight,
          dockArea
        );
        livePosRef.current = next;
        setLivePos(next);
      };

      const endDrag = (ev: PointerEvent) => {
        itemRef.current?.releasePointerCapture(ev.pointerId);
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", endDrag);
        document.removeEventListener("pointercancel", endDrag);

        if (didDragRef.current) {
          const dockArea = getEffectiveDockArea(
            useWindowStore.getState().dockVisible
          );
          const finalPos = clampFolderPosition(
            livePosRef.current.x,
            livePosRef.current.y,
            globalThis.innerWidth,
            globalThis.innerHeight,
            dockArea
          );
          livePosRef.current = finalPos;
          setLivePos(finalPos);
          onPositionChange(finalPos.x, finalPos.y);
        } else {
          onActivate?.();
        }

        setIsDragging(false);
      };

      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", endDrag);
      document.addEventListener("pointercancel", endDrag);
    },
    [onActivate, onPositionChange]
  );

  const scale = isDragging ? DRAG_SCALE : isHovered ? 1.04 : 1;

  return (
    <motion.div
      ref={itemRef}
      role={onActivate ? "button" : "group"}
      tabIndex={onActivate ? 0 : undefined}
      className={`desktop-folder pointer-events-auto ${
        isDragging ? "desktop-folder-dragging" : ""
      }`}
      style={{ left: livePos.x, top: livePos.y }}
      animate={{ scale }}
      transition={ITEM_SPRING}
      onPointerDown={handlePointerDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={
        onActivate
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onActivate();
              }
            }
          : undefined
      }
      aria-label={title}
      data-desktop-item={itemId}
    >
      <div className="desktop-folder-icon">
        <img
          src={iconSrc}
          alt=""
          className="desktop-folder-svg"
          draggable={false}
        />
      </div>
      <span className="desktop-folder-label">{title}</span>
    </motion.div>
  );
}
