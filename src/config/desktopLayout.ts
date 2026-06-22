import { getAppConfig } from "@/config/apps";
import { PROJECT_CATEGORY_IDS } from "@/config/categories";
import { MENU_BAR_HEIGHT } from "@/components/window/resizeUtils";
import type { DesktopIconId, ProjectCategory } from "@/types";

const home = getAppConfig("home");

/** Default Home window geometry — folders align under this on load */
export const HOME_WINDOW = {
  x: home?.defaultPosition?.x ?? 120,
  y: home?.defaultPosition?.y ?? 93,
  width: home?.defaultSize.width ?? 520,
  height: home?.defaultSize.height ?? 420,
} as const;

export const DESKTOP_FOLDER_LAYOUT = {
  /** Gap below Home title bar + content */
  gapBelowHome: 33,
  itemWidth: 72,
  itemHeight: 76,
  iconWidth: 56,
  iconHeight: 46,
  gap: 10,
} as const;

export function getDesktopFolderRowTop() {
  return HOME_WINDOW.y + HOME_WINDOW.height + DESKTOP_FOLDER_LAYOUT.gapBelowHome;
}

export function getDefaultFolderPositions(): Record<
  ProjectCategory,
  { x: number; y: number }
> {
  const y = getDesktopFolderRowTop();
  const { itemWidth } = DESKTOP_FOLDER_LAYOUT;
  const count = PROJECT_CATEGORY_IDS.length;
  const slotWidth = HOME_WINDOW.width / count;

  return PROJECT_CATEGORY_IDS.reduce(
    (acc, id, index) => {
      acc[id] = {
        x: HOME_WINDOW.x + slotWidth * index + (slotWidth - itemWidth) / 2,
        y,
      };
      return acc;
    },
    {} as Record<ProjectCategory, { x: number; y: number }>
  );
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

export function getDefaultDesktopIconPositions(): Record<
  DesktopIconId,
  { x: number; y: number }
> {
  const columnX = HOME_WINDOW.x + HOME_WINDOW.width + 48;
  const startY = HOME_WINDOW.y + 72;
  const rowGap = 88;

  return {
    trash: { x: columnX, y: startY },
    calculator: { x: columnX, y: startY + rowGap },
    fileImage: { x: columnX, y: startY + rowGap * 2 },
  };
}
