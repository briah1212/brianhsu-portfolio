import type { AppConfig } from "@/types";

export const APPS: AppConfig[] = [
  {
    id: "home",
    title: "Home",
    icon: "🏠",
    color: "#5AC8FA",
    defaultSize: { width: 520, height: 420 },
    defaultPosition: { x: 280, y: 130 },
  },
  {
    id: "about",
    title: "About",
    icon: "👤",
    color: "#AF52DE",
    defaultSize: { width: 580, height: 520 },
    defaultPosition: { x: 820, y: 95 },
  },
  {
    id: "projects",
    title: "Projects",
    icon: "💼",
    color: "#FF9500",
    defaultSize: { width: 720, height: 560 },
  },
  {
    id: "contact",
    title: "Contact",
    icon: "✉️",
    color: "#34C759",
    defaultSize: { width: 440, height: 400 },
  },
  {
    id: "terminal",
    title: "Terminal",
    icon: "⌨️",
    color: "#1C1C1E",
    defaultSize: { width: 600, height: 400 },
  },
];

export function getAppConfig(appId: string): AppConfig | undefined {
  return APPS.find((app) => app.id === appId);
}
