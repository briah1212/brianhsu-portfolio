"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SHORTCUTS = [
  { keys: "⌘ W", description: "Close active window" },
  { keys: "⌘ M", description: "Minimize active window" },
  { keys: "⌘ 1–5", description: "Focus window by position" },
  { keys: "Click dock icon", description: "Open or focus an app" },
  { keys: "Drag title bar", description: "Move window" },
  { keys: "Drag edges / corners", description: "Resize window" },
  { keys: "Green button", description: "Maximize / restore window" },
];

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="menu-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onPointerDown={onClose}
        >
          <motion.div
            className="menu-modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onPointerDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="shortcuts-title"
          >
            <h2 id="shortcuts-title" className="menu-modal-title">
              Keyboard Shortcuts
            </h2>
            <ul className="menu-modal-list">
              {SHORTCUTS.map((item) => (
                <li key={item.keys} className="menu-modal-row">
                  <kbd className="menu-modal-kbd">{item.keys}</kbd>
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
            <button type="button" className="menu-modal-close" onClick={onClose}>
              Done
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
