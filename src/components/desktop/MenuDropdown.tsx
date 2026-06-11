"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface MenuDropdownProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}

export function MenuDropdown({
  open,
  onClose,
  anchorRef,
  children,
  align = "start",
  className = "",
}: MenuDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return;
      }
      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, anchorRef]);

  const anchorRect = anchorRef.current?.getBoundingClientRect();
  const top = (anchorRect?.bottom ?? 28) + 4;
  const positionStyle =
    align === "end"
      ? { right: globalThis.innerWidth - (anchorRect?.right ?? 0), top }
      : { left: anchorRect?.left ?? 0, top };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          className={`menu-dropdown ${className}`.trim()}
          style={positionStyle}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          role="menu"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface MenuItemProps {
  label: string;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  selected?: boolean;
}

export function MenuItem({
  label,
  shortcut,
  onClick,
  disabled = false,
  active = false,
  selected = false,
}: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`menu-dropdown-item ${active ? "menu-dropdown-item-active" : ""} ${
        disabled ? "menu-dropdown-item-disabled" : ""
      }`}
    >
      <span className="menu-dropdown-item-label">
        <span className="menu-dropdown-check-slot" aria-hidden>
          {selected ? "✓" : ""}
        </span>
        {label}
      </span>
      {shortcut && <span className="menu-dropdown-shortcut">{shortcut}</span>}
    </button>
  );
}

export function MenuDivider() {
  return <div className="menu-dropdown-divider" role="separator" />;
}
