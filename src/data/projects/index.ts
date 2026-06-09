import type { Project } from "@/types";

import cognitiveLoad from "./cognitive-load-tracker.json";
import distributedCache from "./distributed-cache.json";
import lyftRouting from "./lyft-routing.json";
import threadPool from "./thread-pool.json";

const projects: Project[] = [
  distributedCache,
  cognitiveLoad,
  lyftRouting,
  threadPool,
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
