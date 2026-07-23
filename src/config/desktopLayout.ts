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
 * the first item (Academics) as a second-column accent. These are exact
 * coordinates captured from the hand-tuned reference layout, not a formula,
 * so the default arrangement matches it pixel-for-pixel.
 */
const FOLDER_POSITIONS: Record<ProjectCategory, { x: number; y: number }> = {
  academics: { x: 28, y: 55 },
  work: { x: 28, y: 150 },
  research: { x: 26, y: 242 },
  systems: { x: 26, y: 339 },
  personal: { x: 23, y: 439 },
};

const DESKTOP_ICON_POSITIONS: Record<DesktopIconId, { x: number; y: number }> = {
  fileImage: { x: 123, y: 58 },
  trash: { x: 22, y: 542 },
  calculator: { x: 23, y: 643 },
};

export function getDefaultFolderPositions(): Record<
  ProjectCategory,
  { x: number; y: number }
> {
  return { ...FOLDER_POSITIONS };
}

export function getDefaultDesktopIconPositions(): Record<
  DesktopIconId,
  { x: number; y: number }
> {
  return { ...DESKTOP_ICON_POSITIONS };
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
