"use client";

import { useCallback } from "react";
import { PROJECT_CATEGORIES } from "@/config/categories";
import { getDesktopFolderRowTop, HOME_WINDOW } from "@/config/desktopLayout";
import { useWindowStore } from "@/store/windowStore";
import { DesktopFolder } from "./DesktopFolder";
import type { ProjectCategory } from "@/types";

export function DesktopFolders() {
  const openApp = useWindowStore((s) => s.openApp);

  const handleOpen = useCallback(
    (categoryId: ProjectCategory) => {
      openApp("projects", categoryId);
    },
    [openApp]
  );

  return (
    <div
      className="desktop-folders pointer-events-none absolute z-[5]"
      style={{
        top: getDesktopFolderRowTop(),
        left: HOME_WINDOW.x,
        width: HOME_WINDOW.width,
      }}
    >
      <div className="desktop-folders-row pointer-events-auto flex w-full flex-nowrap items-start justify-evenly">
        {PROJECT_CATEGORIES.map((category) => (
          <DesktopFolder
            key={category.id}
            categoryId={category.id}
            title={category.title}
            onOpen={() => handleOpen(category.id)}
          />
        ))}
      </div>
    </div>
  );
}
