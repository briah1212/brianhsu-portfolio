import { create } from "zustand";
import { APPS, getAppConfig } from "@/config/apps";
import { getProjectsWindowTitle } from "@/config/categories";
import {
  getMaximizedWindowBounds,
  getEffectiveDockArea,
} from "@/components/window/resizeUtils";
import type { AppId, DesktopIconId, DockIconPosition, ProjectCategory, WindowState } from "@/types";
import {
  getDefaultFolderPositions,
  getDefaultDesktopIconPositions,
} from "@/config/desktopLayout";

const THEME_STORAGE_KEY = "portfolio-theme";
const FOLDER_POSITIONS_KEY = "portfolio:folder-positions";
const DESKTOP_ICON_POSITIONS_KEY = "portfolio:desktop-icon-positions";

function hasMaximizedWindow(windows: WindowState[]): boolean {
  return windows.some((w) => w.isMaximized && !w.isMinimized);
}

function readStoredTheme(): "light" | "dark" | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

interface WindowStore {
  windows: WindowState[];
  activeWindowId: string | null;
  topZIndex: number;
  theme: "light" | "dark";
  dockPositions: Record<AppId, DockIconPosition | null>;
  genieOrigin: { x: number; y: number } | null;
  genieAppId: AppId | null;
  dockVisible: boolean;
  folderPositions: Record<ProjectCategory, { x: number; y: number }>;
  desktopIconPositions: Record<DesktopIconId, { x: number; y: number }>;

  setDockPosition: (appId: AppId, x: number, y: number) => void;
  openApp: (appId: AppId, route?: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximizeWindow: (id: string) => void;
  commitRestoreBounds: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowState>) => void;
  navigateInWindow: (id: string, route?: string) => void;
  toggleTheme: () => void;
  hydrateTheme: () => void;
  setDockVisible: (visible: boolean) => void;
  updateFolderPosition: (
    categoryId: ProjectCategory,
    x: number,
    y: number
  ) => void;
  hydrateFolderPositions: () => void;
  updateDesktopIconPosition: (
    iconId: DesktopIconId,
    x: number,
    y: number
  ) => void;
  hydrateDesktopIconPositions: () => void;
  closeAllWindows: () => void;
  openAllApps: () => void;
  bringAllToFront: () => void;
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
  topZIndex: 10000,
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
  dockVisible: true,
  folderPositions: getDefaultFolderPositions(),
  desktopIconPositions: getDefaultDesktopIconPositions(),

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
      title:
        appId === "projects"
          ? getProjectsWindowTitle(route)
          : config.title,
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
      return {
        windows: remaining,
        activeWindowId,
        dockVisible: hasMaximizedWindow(remaining)
          ? state.dockVisible
          : true,
      };
    }),

  minimizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w
      ),
      activeWindowId:
        state.activeWindowId === id ? null : state.activeWindowId,
    })),

  toggleMaximizeWindow: (id) => {
    const nextZ = get().topZIndex + 1;
    const target = get().windows.find((w) => w.id === id);
    if (!target) return;

    if (target.isMaximized) {
      set((state) => {
        const windows = state.windows.map((w) => {
          if (w.id !== id) return w;
          return { ...w, isMaximized: false, zIndex: nextZ };
        });
        return {
          windows,
          activeWindowId: id,
          topZIndex: nextZ,
          dockVisible: hasMaximizedWindow(windows) ? state.dockVisible : true,
        };
      });
      return;
    }

    const maximized = getMaximizedWindowBounds(undefined, undefined, 0);
    set((state) => ({
      dockVisible: false,
      windows: state.windows.map((w) => {
        if (w.id !== id) return w;
        return {
          ...w,
          isMaximized: true,
          preMaximizeBounds: {
            x: w.x,
            y: w.y,
            width: w.width,
            height: w.height,
          },
          x: maximized.x,
          y: maximized.y,
          width: maximized.width,
          height: maximized.height,
          zIndex: nextZ,
        };
      }),
      activeWindowId: id,
      topZIndex: nextZ,
    }));
  },

  commitRestoreBounds: (id) =>
    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id !== id || !w.preMaximizeBounds) return w;
        const bounds = w.preMaximizeBounds;
        return {
          ...w,
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          preMaximizeBounds: undefined,
        };
      }),
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
        w.id === id
          ? {
              ...w,
              route,
              title:
                w.appId === "projects"
                  ? getProjectsWindowTitle(route)
                  : w.title,
            }
          : w
      ),
    })),

  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      }
      return { theme };
    }),

  hydrateTheme: () => {
    const stored = readStoredTheme();
    if (stored) set({ theme: stored });
  },

  updateFolderPosition: (categoryId, x, y) =>
    set((state) => {
      const folderPositions = {
        ...state.folderPositions,
        [categoryId]: { x, y },
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(
          FOLDER_POSITIONS_KEY,
          JSON.stringify(folderPositions)
        );
      }
      return { folderPositions };
    }),

  hydrateFolderPositions: () => {
    if (typeof window === "undefined") return;
    const defaults = getDefaultFolderPositions();
    try {
      const raw = localStorage.getItem(FOLDER_POSITIONS_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as Partial<
        Record<ProjectCategory, { x: number; y: number }>
      >;
      set({
        folderPositions: { ...defaults, ...stored },
      });
    } catch {
      /* ignore invalid stored positions */
    }
  },

  updateDesktopIconPosition: (iconId, x, y) =>
    set((state) => {
      const desktopIconPositions = {
        ...state.desktopIconPositions,
        [iconId]: { x, y },
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(
          DESKTOP_ICON_POSITIONS_KEY,
          JSON.stringify(desktopIconPositions)
        );
      }
      return { desktopIconPositions };
    }),

  hydrateDesktopIconPositions: () => {
    if (typeof window === "undefined") return;
    const defaults = getDefaultDesktopIconPositions();
    try {
      const raw = localStorage.getItem(DESKTOP_ICON_POSITIONS_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as Partial<
        Record<DesktopIconId, { x: number; y: number }>
      >;
      set({
        desktopIconPositions: { ...defaults, ...stored },
      });
    } catch {
      /* ignore invalid stored positions */
    }
  },

  setDockVisible: (visible) => {
    const { dockVisible } = get();
    if (dockVisible === visible) return;

    const dockArea = getEffectiveDockArea(visible);
    const maximizedBounds = getMaximizedWindowBounds(
      undefined,
      undefined,
      dockArea
    );

    set((state) => ({
      dockVisible: visible,
      windows: state.windows.map((w) =>
        w.isMaximized ? { ...w, ...maximizedBounds } : w
      ),
    }));
  },

  closeAllWindows: () =>
    set({ windows: [], activeWindowId: null, dockVisible: true }),

  openAllApps: () => {
    for (const app of APPS) {
      get().openApp(app.id);
    }
  },

  bringAllToFront: () => {
    const visible = get().windows.filter((w) => !w.isMinimized);
    if (visible.length === 0) return;

    let nextZ = get().topZIndex;
    const zById = new Map<string, number>();
    for (const win of visible) {
      nextZ += 1;
      zById.set(win.id, nextZ);
    }

    set((state) => ({
      windows: state.windows.map((w) =>
        zById.has(w.id) ? { ...w, zIndex: zById.get(w.id)! } : w
      ),
      topZIndex: nextZ,
      activeWindowId: visible[visible.length - 1]?.id ?? state.activeWindowId,
    }));
  },
}));
