import type { AppConfig } from "@/types";
import { DESKTOP_ASSETS } from "./assets";

export const APPS: AppConfig[] = [
  {
    id: "home",
    title: "Home",
    icon: DESKTOP_ASSETS.book,
    color: "#5AC8FA",
    defaultSize: { width: 701, height: 517 },
    defaultPosition: { x: 207, y: 157 },
  },
  {
    id: "about",
    title: "About",
    icon: DESKTOP_ASSETS.fileNormal,
    color: "#AF52DE",
    defaultSize: { width: 733, height: 525 },
    defaultPosition: { x: 638, y: 61 },
  },
  {
    id: "projects",
    title: "Projects",
    icon: DESKTOP_ASSETS.folder,
    color: "#FF9500",
    defaultSize: { width: 720, height: 560 },
  },
  {
    id: "contact",
    title: "Contact",
    icon: DESKTOP_ASSETS.mail,
    color: "#34C759",
    defaultSize: { width: 440, height: 400 },
  },
  {
    id: "terminal",
    title: "Terminal",
    icon: DESKTOP_ASSETS.fileCode,
    color: "#1C1C1E",
    defaultSize: { width: 600, height: 400 },
  },
  {
    id: "code",
    title: "Code",
    // TODO: dedicated IDE icon; reusing the terminal file-code icon for now
    icon: DESKTOP_ASSETS.fileCode,
    color: "#0A84FF",
    defaultSize: { width: 960, height: 620 },
    defaultPosition: { x: 160, y: 72 },
  },
  {
    id: "calculator",
    title: "Calculator",
    icon: DESKTOP_ASSETS.calculator,
    color: "#FF3B30",
    defaultSize: { width: 320, height: 480 },
    resizable: false,
  },
  {
    id: "photos",
    title: "Photos",
    icon: DESKTOP_ASSETS.fileImage,
    color: "#FF2D55",
    defaultSize: { width: 720, height: 560 },
  },
  {
    id: "trash",
    title: "Trash",
    icon: DESKTOP_ASSETS.trash,
    color: "#8E8E93",
    defaultSize: { width: 720, height: 560 },
  },
];

export function getAppConfig(appId: string): AppConfig | undefined {
  return APPS.find((app) => app.id === appId);
}
