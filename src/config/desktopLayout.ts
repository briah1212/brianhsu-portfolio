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
 * Category folders, then Trash/Calculator, stack in a single vertical column
 * pinned to the left edge. Photos breaks out of the column and sits beside
 * the first item (Academics) as a second-column accent, matching the
 * reference layout.
 */
const LEFT_COLUMN = {
  x: 40,
  top: MENU_BAR_HEIGHT + 24,
  rowGap: 86,
  secondColumnOffset: 96,
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
  // Trash and Calculator continue the column directly below the category
  // folders; Photos sits beside the first folder (Academics) instead.
  const lastCategoryIndex = PROJECT_CATEGORY_IDS.length - 1;
  return {
    fileImage: {
      x: LEFT_COLUMN.x + LEFT_COLUMN.secondColumnOffset,
      y: columnY(0),
    },
    trash: { x: LEFT_COLUMN.x, y: columnY(lastCategoryIndex + 1) },
    calculator: { x: LEFT_COLUMN.x, y: columnY(lastCategoryIndex + 2) },
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
