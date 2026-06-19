"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { isProjectCategory } from "@/config/categories";
import { getAllProjects, getProjectBySlug } from "@/data/projects";
import { useWindowStore } from "@/store/windowStore";
import { CategoryProjectsView } from "@/components/projects/CategoryProjectsView";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectCaseStudy } from "@/components/projects/ProjectCaseStudy";

interface ProjectsAppProps {
  windowId: string;
  route?: string;
}

export function ProjectsApp({ windowId, route }: ProjectsAppProps) {
  const navigateInWindow = useWindowStore((s) => s.navigateInWindow);
  const listRouteRef = useRef<string | undefined>(route);

  useEffect(() => {
    if (route && isProjectCategory(route)) {
      listRouteRef.current = route;
    } else if (!route) {
      listRouteRef.current = undefined;
    }
  }, [route]);

  const openProject = (slug: string) => navigateInWindow(windowId, slug);

  const goBack = () => navigateInWindow(windowId, listRouteRef.current);

  if (route && isProjectCategory(route)) {
    return (
      <CategoryProjectsView
        category={route}
        onOpenProject={openProject}
      />
    );
  }

  const activeProject = route ? getProjectBySlug(route) : undefined;

  if (activeProject) {
    return (
      <AnimatePresence mode="wait">
        <ProjectCaseStudy
          key={activeProject.slug}
          project={activeProject}
          onBack={goBack}
        />
      </AnimatePresence>
    );
  }

  const projects = getAllProjects();

  return (
    <div className="app-content h-full overflow-y-auto p-5">
      <h2 className="text-lg font-semibold">Projects</h2>
      <p className="mt-1 text-xs text-foreground/50">
        Selected work across systems, research, and internships.
      </p>
      <div className="mt-4 flex flex-col">
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={i}
            onClick={() => openProject(project.slug)}
          />
        ))}
      </div>
    </div>
  );
}
