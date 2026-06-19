import { getProjectBySlug } from "@/data/projects";
import type { ProjectCategory } from "@/types";

export const PROJECT_CATEGORIES = [
  { id: "academics", title: "Academics", icon: "🎓", color: "#5AC8FA" },
  { id: "work", title: "Work", icon: "💼", color: "#34C759" },
  { id: "research", title: "Research", icon: "🔬", color: "#AF52DE" },
  { id: "systems", title: "Systems", icon: "🖥️", color: "#FF9500" },
  { id: "personal", title: "Personal", icon: "✨", color: "#FF2D55" },
] as const;

export const PROJECT_CATEGORY_IDS = PROJECT_CATEGORIES.map((c) => c.id);

export function isProjectCategory(value: string): value is ProjectCategory {
  return (PROJECT_CATEGORY_IDS as readonly string[]).includes(value);
}

export function getCategoryConfig(id: ProjectCategory) {
  return PROJECT_CATEGORIES.find((c) => c.id === id);
}

export function getProjectsWindowTitle(route?: string): string {
  if (!route) return "Projects";
  const category = getCategoryConfig(route as ProjectCategory);
  if (category) return category.title;
  const project = getProjectBySlug(route);
  if (project) return project.title;
  return "Projects";
}
