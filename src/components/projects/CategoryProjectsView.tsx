"use client";

import { getCategoryConfig } from "@/config/categories";
import { getProjectsByCategory } from "@/data/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { ProjectCategory } from "@/types";

interface CategoryProjectsViewProps {
  category: ProjectCategory;
  onOpenProject: (slug: string) => void;
}

export function CategoryProjectsView({
  category,
  onOpenProject,
}: CategoryProjectsViewProps) {
  const config = getCategoryConfig(category);
  const projects = getProjectsByCategory(category);

  return (
    <div className="app-content h-full overflow-y-auto p-5">
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>
          {config?.icon}
        </span>
        <h2 className="text-lg font-semibold">{config?.title ?? category}</h2>
      </div>
      <p className="mt-1 text-xs text-foreground/50">
        Projects in this category — more coming soon.
      </p>

      {projects.length > 0 ? (
        <div className="mt-4 flex flex-col">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={i}
              onClick={() => onOpenProject(project.slug)}
            />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-center text-sm text-foreground/40">
          No projects in this folder yet.
        </p>
      )}
    </div>
  );
}
