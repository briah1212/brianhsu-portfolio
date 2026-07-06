export type AppId = "home" | "about" | "projects" | "contact" | "terminal" | "calculator" | "photos" | "trash";

export interface AppConfig {
  id: AppId;
  title: string;
  icon: string;
  color: string;
  defaultSize: { width: number; height: number };
  defaultPosition?: { x: number; y: number };
  resizable?: boolean; // Allow window resizing (default: true)
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  /** Bounds saved before maximize, used to restore on un-maximize */
  preMaximizeBounds?: { x: number; y: number; width: number; height: number };
  /** Internal route within the app (e.g. project slug) */
  route?: string;
}

export type ProjectCategory =
  | "academics"
  | "work"
  | "research"
  | "systems"
  | "personal";

export type DesktopIconId = "trash" | "calculator" | "fileImage";

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  techStack: string[];
  problem: string;
  approach: string;
  solution: string;
  learned: string;
  /** Optional: constraints & scope for deep case studies (sanitized) */
  constraints?: string;
  /** Optional: sanitized architecture overview for deep case studies */
  architecture?: string;
  /** Optional: explicit tradeoffs section for deep case studies */
  tradeoffs?: string;
  links: ProjectLink[];
  image?: string;
  featured?: boolean;
  /** If true this project is hidden from listings (placeholder not yet ready) */
  comingSoon?: boolean;
}

export interface DockIconPosition {
  appId: AppId;
  x: number;
  y: number;
}
