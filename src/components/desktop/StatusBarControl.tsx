"use client";

import { useRef, type ReactNode } from "react";
import { MenuDropdown } from "./MenuDropdown";

interface StatusBarControlProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
  dropdownChildren: ReactNode;
  className?: string;
  dropdownClassName?: string;
}

export function StatusBarControl({
  open,
  onToggle,
  onClose,
  ariaLabel,
  children,
  dropdownChildren,
  className = "",
  dropdownClassName = "",
}: StatusBarControlProps) {
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        className={`menu-bar-status-btn ${open ? "menu-bar-status-btn-active" : ""} ${className}`.trim()}
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={ariaLabel}
      >
        {children}
      </button>
      <MenuDropdown
        open={open}
        onClose={onClose}
        anchorRef={anchorRef}
        align="end"
        className={dropdownClassName}
      >
        {dropdownChildren}
      </MenuDropdown>
    </>
  );
}
