import type { Project, ProjectCategory } from "@/types";

import cognitiveLoad from "./cognitive-load-tracker.json";
import distributedCache from "./distributed-cache.json";
import lyftRouting from "./lyft-routing.json";
import placeholderAcademics1 from "./placeholder-academics-1.json";
import placeholderAcademics2 from "./placeholder-academics-2.json";
import placeholderPersonal1 from "./placeholder-personal-1.json";
import placeholderPersonal2 from "./placeholder-personal-2.json";
import placeholderResearch1 from "./placeholder-research-1.json";
import placeholderWork1 from "./placeholder-work-1.json";
import threadPool from "./thread-pool.json";

const projects: Project[] = [
  distributedCache,
  threadPool,
  cognitiveLoad,
  lyftRouting,
  placeholderAcademics1,
  placeholderAcademics2,
  placeholderWork1,
  placeholderResearch1,
  placeholderPersonal1,
  placeholderPersonal2,
] as Project[];

export function getAllProjects(): Project[] {
  return projects;
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjectsByCategory(category: ProjectCategory): Project[] {
  return projects.filter((p) => p.category === category);
}
