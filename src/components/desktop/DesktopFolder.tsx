"use client";

import { motion } from "framer-motion";
import type { ProjectCategory } from "@/types";

interface DesktopFolderProps {
  categoryId: ProjectCategory;
  title: string;
  onOpen: () => void;
}

export function DesktopFolder({ categoryId, title, onOpen }: DesktopFolderProps) {
  return (
    <motion.button
      type="button"
      className="desktop-folder"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      aria-label={`${title} folder`}
      data-category={categoryId}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      <div className="desktop-folder-icon">
        <img
          src="/mac-folder.svg"
          alt=""
          className="desktop-folder-svg"
          draggable={false}
        />
      </div>
      <span className="desktop-folder-label">{title}</span>
    </motion.button>
  );
}
