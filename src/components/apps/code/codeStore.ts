import { create } from "zustand";
import { getAllFiles, getAllFolders } from "./codeFiles";

export type SidebarView = "explorer" | "search" | "scm";

interface RevealRequest {
  path: string;
  line: number;
  /** Monotonic id so repeated reveals of the same line still fire */
  id: number;
}

interface CodeState {
  /** Current editor contents by path */
  buffers: Record<string, string>;
  /** Last-saved contents by path */
  saved: Record<string, string>;
  /** Pristine contents as shipped, for source-control diffing */
  original: Record<string, string>;
  openTabs: string[];
  activePath: string | null;
  expandedFolders: Record<string, boolean>;
  sidebarView: SidebarView;
  sidebarVisible: boolean;
  panelVisible: boolean;
  reveal: RevealRequest | null;
}

interface CodeStore extends CodeState {
  openFile: (path: string, line?: number) => void;
  closeTab: (path: string) => void;
  setActivePath: (path: string) => void;
  editFile: (path: string, content: string) => void;
  saveFile: (path: string) => void;
  revertFile: (path: string) => void;
  toggleFolder: (path: string) => void;
  selectSidebarView: (view: SidebarView) => void;
  toggleSidebar: () => void;
  togglePanel: () => void;
  clearReveal: () => void;
}

export function getInitialCodeState(): CodeState {
  const contents: Record<string, string> = {};
  for (const file of getAllFiles()) {
    contents[file.path] = file.content;
  }

  const expandedFolders: Record<string, boolean> = {};
  for (const folder of getAllFolders()) {
    expandedFolders[folder.path] = true;
  }

  return {
    buffers: { ...contents },
    saved: { ...contents },
    original: contents,
    openTabs: ["README.md", "about/brian.json"],
    activePath: "README.md",
    expandedFolders,
    sidebarView: "explorer",
    sidebarVisible: true,
    panelVisible: false,
    reveal: null,
  };
}

let revealId = 0;

export const useCodeStore = create<CodeStore>((set) => ({
  ...getInitialCodeState(),

  openFile: (path, line) =>
    set((state) => ({
      openTabs: state.openTabs.includes(path)
        ? state.openTabs
        : [...state.openTabs, path],
      activePath: path,
      reveal:
        line !== undefined ? { path, line, id: ++revealId } : state.reveal,
    })),

  closeTab: (path) =>
    set((state) => {
      const index = state.openTabs.indexOf(path);
      const openTabs = state.openTabs.filter((tab) => tab !== path);
      const activePath =
        state.activePath === path
          ? openTabs[Math.min(index, openTabs.length - 1)] ?? null
          : state.activePath;
      return { openTabs, activePath };
    }),

  setActivePath: (path) => set({ activePath: path }),

  editFile: (path, content) =>
    set((state) => ({
      buffers: { ...state.buffers, [path]: content },
    })),

  saveFile: (path) =>
    set((state) => ({
      saved: { ...state.saved, [path]: state.buffers[path] },
    })),

  revertFile: (path) =>
    set((state) => ({
      buffers: { ...state.buffers, [path]: state.original[path] },
      saved: { ...state.saved, [path]: state.original[path] },
    })),

  toggleFolder: (path) =>
    set((state) => ({
      expandedFolders: {
        ...state.expandedFolders,
        [path]: !state.expandedFolders[path],
      },
    })),

  selectSidebarView: (view) =>
    set((state) =>
      state.sidebarVisible && state.sidebarView === view
        ? { sidebarVisible: false }
        : { sidebarView: view, sidebarVisible: true }
    ),

  toggleSidebar: () =>
    set((state) => ({ sidebarVisible: !state.sidebarVisible })),

  togglePanel: () => set((state) => ({ panelVisible: !state.panelVisible })),

  clearReveal: () => set({ reveal: null }),
}));

export function isDirty(state: CodeState, path: string): boolean {
  return state.buffers[path] !== state.saved[path];
}

export function isModified(state: CodeState, path: string): boolean {
  return state.saved[path] !== state.original[path];
}
