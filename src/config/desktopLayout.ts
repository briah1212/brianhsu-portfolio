import { PROJECT_CATEGORY_IDS } from "@/config/categories";
import { MENU_BAR_HEIGHT } from "@/components/window/resizeUtils";
import type { DesktopIconId, ProjectCategory } from "@/types";

export const DESKTOP_FOLDER_LAYOUT = {
  itemWidth: 72,
  itemHeight: 76,
  iconWidth: 56,
  iconHeight: 46,
  gap: 10,
} as const;

/**
 * All desktop items (category folders, then Photos/Trash/Calculator) stack in a
 * single vertical column pinned to the left edge of the screen.
 */
const LEFT_COLUMN = {
  x: 40,
  top: MENU_BAR_HEIGHT + 24,
  rowGap: 86,
} as const;

function columnY(index: number): number {
  return LEFT_COLUMN.top + index * LEFT_COLUMN.rowGap;
}

export function getDefaultFolderPositions(): Record<
  ProjectCategory,
  { x: number; y: number }
> {
  return PROJECT_CATEGORY_IDS.reduce(
    (acc, id, index) => {
      acc[id] = { x: LEFT_COLUMN.x, y: columnY(index) };
      return acc;
    },
    {} as Record<ProjectCategory, { x: number; y: number }>
  );
}

export function getDefaultDesktopIconPositions(): Record<
  DesktopIconId,
  { x: number; y: number }
> {
  // Continue the column directly below the category folders.
  const offset = PROJECT_CATEGORY_IDS.length;
  return {
    fileImage: { x: LEFT_COLUMN.x, y: columnY(offset) },
    trash: { x: LEFT_COLUMN.x, y: columnY(offset + 1) },
    calculator: { x: LEFT_COLUMN.x, y: columnY(offset + 2) },
  };
}

export function clampFolderPosition(
  x: number,
  y: number,
  viewportWidth: number,
  viewportHeight: number,
  dockArea: number
): { x: number; y: number } {
  const { itemWidth, itemHeight } = DESKTOP_FOLDER_LAYOUT;
  return {
    x: Math.max(0, Math.min(viewportWidth - itemWidth, x)),
    y: Math.max(
      MENU_BAR_HEIGHT,
      Math.min(viewportHeight - itemHeight - dockArea, y)
    ),
  };
}
