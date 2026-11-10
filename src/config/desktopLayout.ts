import { DOCK_AREA, MENU_BAR_HEIGHT } from "@/components/window/resizeUtils";
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

/**
 * Factor that squeezes the default left column vertically so its last item
 * clears the dock on short viewports. 1 when everything already fits or the
 * viewport height is unknown (server render).
 */
function getColumnScale(viewportHeight?: number): number {
  if (!viewportHeight) return 1;
  const ys = [
    ...Object.values(FOLDER_POSITIONS),
    ...Object.values(DESKTOP_ICON_POSITIONS),
  ].map((p) => p.y);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  const maxBottom =
    viewportHeight - DESKTOP_FOLDER_LAYOUT.itemHeight - DOCK_AREA;
  if (bottom <= maxBottom) return 1;
  return Math.max(0, (maxBottom - top) / (bottom - top));
}

function fitColumn<K extends string>(
  positions: Record<K, { x: number; y: number }>,
  viewportHeight?: number
): Record<K, { x: number; y: number }> {
  const ys = [
    ...Object.values(FOLDER_POSITIONS),
    ...Object.values(DESKTOP_ICON_POSITIONS),
  ].map((p) => p.y);
  const top = Math.min(...ys);
  const scale = getColumnScale(viewportHeight);
  const fitted = {} as Record<K, { x: number; y: number }>;
  for (const key of Object.keys(positions) as K[]) {
    const { x, y } = positions[key];
    fitted[key] = { x, y: Math.round(top + (y - top) * scale) };
  }
  return fitted;
}

export function getDefaultFolderPositions(
  viewportHeight?: number
): Record<ProjectCategory, { x: number; y: number }> {
  return fitColumn(FOLDER_POSITIONS, viewportHeight);
}

export function getDefaultDesktopIconPositions(
  viewportHeight?: number
): Record<DesktopIconId, { x: number; y: number }> {
  return fitColumn(DESKTOP_ICON_POSITIONS, viewportHeight);
}

/** Keeps saved positions on-screen when the viewport is smaller than when they were saved. */
export function clampStoredPositions<K extends string>(
  positions: Partial<Record<K, { x: number; y: number }>>,
  viewportWidth: number,
  viewportHeight: number
): Partial<Record<K, { x: number; y: number }>> {
  const clamped: Partial<Record<K, { x: number; y: number }>> = {};
  for (const key of Object.keys(positions) as K[]) {
    const pos = positions[key];
    if (!pos || typeof pos.x !== "number" || typeof pos.y !== "number") continue;
    clamped[key] = clampFolderPosition(pos.x, pos.y, viewportWidth, viewportHeight, 0);
  }
  return clamped;
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
