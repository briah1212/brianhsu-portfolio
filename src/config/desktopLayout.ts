import { getAppConfig } from "@/config/apps";

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
  iconWidth: 56,
  iconHeight: 46,
  gap: 10,
} as const;

export function getDesktopFolderRowTop() {
  return HOME_WINDOW.y + HOME_WINDOW.height + DESKTOP_FOLDER_LAYOUT.gapBelowHome;
}
