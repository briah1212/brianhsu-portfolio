"use client";

import { useCallback } from "react";
import { DESKTOP_ASSETS } from "@/config/assets";
import { PROJECT_CATEGORIES } from "@/config/categories";
import { DESKTOP_ICONS } from "@/config/desktopIcons";
import { useWindowStore } from "@/store/windowStore";
import { DesktopItem } from "./DesktopItem";
import type { DesktopIconId, ProjectCategory } from "@/types";

export function DesktopFolders() {
  const openApp = useWindowStore((s) => s.openApp);
  const folderPositions = useWindowStore((s) => s.folderPositions);
  const desktopIconPositions = useWindowStore((s) => s.desktopIconPositions);
  const updateFolderPosition = useWindowStore((s) => s.updateFolderPosition);
  const updateDesktopIconPosition = useWindowStore(
    (s) => s.updateDesktopIconPosition
  );

  const handleOpenFolder = useCallback(
    (categoryId: ProjectCategory) => {
      openApp("projects", categoryId);
    },
    [openApp]
  );

  const handleFolderPositionChange = useCallback(
    (categoryId: ProjectCategory, x: number, y: number) => {
      updateFolderPosition(categoryId, x, y);
    },
    [updateFolderPosition]
  );

  const handleIconPositionChange = useCallback(
    (iconId: DesktopIconId, x: number, y: number) => {
      updateDesktopIconPosition(iconId, x, y);
    },
    [updateDesktopIconPosition]
  );

  const handleOpenIcon = useCallback(
    (iconId: DesktopIconId) => {
      // Map desktop icon IDs to app IDs
      if (iconId === "calculator") {
        openApp("calculator");
      } else if (iconId === "fileImage") {
        openApp("photos");
      } else if (iconId === "trash") {
        openApp("trash");
      }
    },
    [openApp]
  );

  return (
    <div className="desktop-folders pointer-events-none absolute inset-0 z-[5]">
      {PROJECT_CATEGORIES.map((category) => {
        const position = folderPositions[category.id];
        return (
          <DesktopItem
            key={category.id}
            itemId={category.id}
            title={category.title}
            iconSrc={DESKTOP_ASSETS.folder}
            x={position.x}
            y={position.y}
            onActivate={() => handleOpenFolder(category.id)}
            onPositionChange={(x, y) =>
              handleFolderPositionChange(category.id, x, y)
            }
          />
        );
      })}
      {DESKTOP_ICONS.map((icon) => {
        const position = desktopIconPositions[icon.id];
        return (
          <DesktopItem
            key={icon.id}
            itemId={icon.id}
            title={icon.title}
            iconSrc={icon.iconSrc}
            x={position.x}
            y={position.y}
            onActivate={() => handleOpenIcon(icon.id)}
            onPositionChange={(x, y) =>
              handleIconPositionChange(icon.id, x, y)
            }
          />
        );
      })}
    </div>
  );
}
