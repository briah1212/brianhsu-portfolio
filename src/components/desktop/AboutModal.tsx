"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TECH_STACK = [
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Framer Motion",
  "Zustand",
];

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export function AboutModal({ open, onClose }: AboutModalProps) {
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
            className="menu-modal menu-modal-about"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onPointerDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="about-title"
          >
            <div className="menu-modal-about-icon" aria-hidden>
              🖥️
            </div>
            <h2 id="about-title" className="menu-modal-title">
              About This Site
            </h2>
            <p className="menu-modal-body">
              A macOS-inspired interactive portfolio built to showcase software
              engineering, systems work, and research.
            </p>
            <div className="menu-modal-tech">
              {TECH_STACK.map((tech) => (
                <span key={tech} className="menu-modal-tech-pill">
                  {tech}
                </span>
              ))}
            </div>
            <p className="menu-modal-footer">Brian Hsu — Software Engineer</p>
            <button type="button" className="menu-modal-close" onClick={onClose}>
              OK
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
