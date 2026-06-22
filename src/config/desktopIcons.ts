import { DESKTOP_ASSETS } from "@/config/assets";
import type { DesktopIconId } from "@/types";

export const DESKTOP_ICONS: {
  id: DesktopIconId;
  title: string;
  iconSrc: string;
}[] = [
  { id: "trash", title: "Trash", iconSrc: DESKTOP_ASSETS.trash },
  {
    id: "calculator",
    title: "Calculator",
    iconSrc: DESKTOP_ASSETS.calculator,
  },
  { id: "fileImage", title: "Photos", iconSrc: DESKTOP_ASSETS.fileImage },
];

export const DESKTOP_ICON_IDS = DESKTOP_ICONS.map((icon) => icon.id);
