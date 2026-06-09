import { create } from "zustand";
import { getAppConfig } from "@/config/apps";
import type { AppId, DockIconPosition, WindowState } from "@/types";

interface WindowStore {
  windows: WindowState[];
  activeWindowId: string | null;
  topZIndex: number;
  theme: "light" | "dark";
  dockPositions: Record<AppId, DockIconPosition | null>;
  genieOrigin: { x: number; y: number } | null;
  genieAppId: AppId | null;

  setDockPosition: (appId: AppId, x: number, y: number) => void;
  openApp: (appId: AppId, route?: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowState>) => void;
  navigateInWindow: (id: string, route?: string) => void;
  toggleTheme: () => void;
  setGenieOrigin: (appId: AppId, x: number, y: number) => void;
  clearGenieOrigin: () => void;
}

function getDefaultPosition(index: number) {
  return {
    x: 120 + index * 32,
    y: 80 + index * 28,
  };
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,
  topZIndex: 10,
  theme: "dark",
  dockPositions: {
    home: null,
    about: null,
    projects: null,
    contact: null,
    terminal: null,
  },
  genieOrigin: null,
  genieAppId: null,

  setDockPosition: (appId, x, y) =>
    set((state) => ({
      dockPositions: {
        ...state.dockPositions,
        [appId]: { appId, x, y },
      },
    })),

  setGenieOrigin: (appId, x, y) =>
    set({ genieOrigin: { x, y }, genieAppId: appId }),

  clearGenieOrigin: () => set({ genieOrigin: null, genieAppId: null }),

  openApp: (appId, route) => {
    const config = getAppConfig(appId);
    if (!config) return;

    const existing = get().windows.find(
      (w) => w.appId === appId && !w.isMinimized && w.route === route
    );

    if (existing) {
      get().focusWindow(existing.id);
      return;
    }

    const minimized = get().windows.find(
      (w) => w.appId === appId && w.isMinimized
    );

    if (minimized && !route) {
      const nextZ = get().topZIndex + 1;
      set((state) => ({
        windows: state.windows.map((w) =>
          w.id === minimized.id
            ? { ...w, isMinimized: false, zIndex: nextZ }
            : w
        ),
        activeWindowId: minimized.id,
        topZIndex: nextZ,
      }));
      return;
    }

    const dockPos = get().dockPositions[appId];
    if (dockPos) {
      get().setGenieOrigin(appId, dockPos.x, dockPos.y);
    }

    const index = get().windows.length;
    const pos = config.defaultPosition ?? getDefaultPosition(index);
    const nextZ = get().topZIndex + 1;
    const id = `${appId}-${Date.now()}`;

    const newWindow: WindowState = {
      id,
      appId,
      title: route ? `${config.title}` : config.title,
      x: pos.x,
      y: pos.y,
      width: config.defaultSize.width,
      height: config.defaultSize.height,
      zIndex: nextZ,
      isMinimized: false,
      isMaximized: false,
      route,
    };

    set((state) => ({
      windows: [...state.windows, newWindow],
      activeWindowId: id,
      topZIndex: nextZ,
    }));
  },

  closeWindow: (id) =>
    set((state) => {
      const remaining = state.windows.filter((w) => w.id !== id);
      const activeWindowId =
        state.activeWindowId === id
          ? remaining[remaining.length - 1]?.id ?? null
          : state.activeWindowId;
      return { windows: remaining, activeWindowId };
    }),

  minimizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w
      ),
      activeWindowId:
        state.activeWindowId === id ? null : state.activeWindowId,
    })),

  restoreWindow: (id) => {
    const nextZ = get().topZIndex + 1;
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: false, zIndex: nextZ } : w
      ),
      activeWindowId: id,
      topZIndex: nextZ,
    }));
  },

  focusWindow: (id) => {
    const nextZ = get().topZIndex + 1;
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: nextZ } : w
      ),
      activeWindowId: id,
      topZIndex: nextZ,
    }));
  },

  updateWindow: (id, updates) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    })),

  navigateInWindow: (id, route) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, route } : w
      ),
    })),

  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "dark" ? "light" : "dark",
    })),
}));
